class MappingUl extends HTMLUListElement {
  constructor() {
    super();
  }
}

customElements.define("mapping-ul", MappingUl, { extends: "ul" });
