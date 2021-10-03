class Action {
  name: string;
  tags: string[];
  desc: string;
  dom: HTMLElement;

  constructor(name: string, tags: string, desc: string, listItem: HTMLElement) {
    this.name = name;
    this.tags = tags.split(",");
    this.desc = desc;
    this.dom = listItem;
  }
}

export default Action;
