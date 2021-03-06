/**
 * Copyright © 2019 Johnson & Johnson
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { observable, action } from 'mobx';

class DummyContentNodeStore {
  @observable data = {};

  @action setData(newData: any) {
    this.data = { ...newData };
  }

  constructor(initialData: any) {
    this.data = { ...initialData };
  }
}

export type Actions = {
  setNode(path: string[], data: any): void;
};

export type Getters = {
  getNode(path: string[]): any;
  getKeys(): string[];
};

type Path = string | string[];

export type ContentNode<D> = {
  data: D;
  setData: (data: D) => void;
  keys: string[];
  path: string[];
  child<E extends object>(path: string): ContentNode<E>;
  peer<E extends object>(path: string): ContentNode<E>;
};

export class DefaultContentNode<D extends object> implements ContentNode<D> {
  private actions: Actions;

  private getters: Getters;

  path: string[];

  constructor(actions: Actions, getters: Getters, path: Path) {
    this.actions = actions;
    this.getters = getters;
    const path$1 = path || [];
    this.path = Array.isArray(path$1) ? path$1 : [path$1];
  }

  peer<E extends object>(path: Path) {
    return new DefaultContentNode<E>(this.actions, this.getters, path);
  }

  child<E extends object>(path: Path) {
    const paths = Array.isArray(path) ? path : [path];
    return this.peer<E>([...this.path, ...paths]);
  }

  get data() {
    const { getNode } = this.getters;
    return getNode(this.path) as D;
  }

  setData(dataObj: D) {
    const { setNode } = this.actions;
    setNode(this.path, dataObj);
  }

  get keys() {
    const { getKeys } = this.getters;
    return getKeys();
  }

  static dummy(path = 'root', initialData = {}) {
    const path$1 = Array.isArray(path) ? path : path.split('$');
    const store = new DummyContentNodeStore(initialData);
    const getNode = () => store.data;
    const getKeys = () => path$1;
    const setNode = (p: Path, d: any) => {
      store.setData(d);
    };
    const getters = { getNode, getKeys };
    const actions = { setNode };
    return new DefaultContentNode(actions, getters, path$1);
  }
}
