import { initialMappingList, type Mapping } from "../main.mts";

//export function createMappingLocal(mapping: Mapping) {
//  let local = localStorage.getItem("mappingList");
//  if (local) {
//    localStorage.setItem("mappingList",
//      JSON.stringify((JSON.parse(local) as Mapping[]).push(mapping)));
//  } else {
//    localStorage.setItem("mappingList", JSON.stringify([mapping]));
//  }
//}
//
//export function updateMappingLocal(mapping: Mapping) {
//  let local = localStorage.getItem("mappingList");
//  if (local) {
//    let mappingList = JSON.parse(local) as Mapping[]
//    let index = mappingList.findIndex((m) => m.id === mapping.id);
//    if (index > -1) {
//      mappingList[index] = mapping;
//      localStorage.setItem("mappingList", JSON.stringify(mappingList));
//    }
//  }
//}

export function initializeLocal() {
  let local = localStorage.getItem("mappingList");
  if (!local) {
    localStorage.setItem("mappingList", JSON.stringify(initialMappingList));
  }
}

export function upsertMappingLocal(mapping: Mapping) {
  let local = localStorage.getItem("mappingList");
  if (local) {
    let mappingList = JSON.parse(local) as Mapping[]
    let index = mappingList.findIndex((m) => m.id === mapping.id);
    if (index > -1) {
      mappingList.splice(index, 1, mapping);
    } else {
      mappingList.unshift(mapping);
    }
    localStorage.setItem("mappingList", JSON.stringify(mappingList));
  } else {
    localStorage.setItem("mappingList", JSON.stringify([mapping]));
  }
}

export function getMappingLocal(id: string): Mapping | null {
  let local = localStorage.getItem("mappingList");
  if (local) {
    let mappingList = JSON.parse(local) as Mapping[]
    let index = mappingList.findIndex((m) => m.id === id);
    if (index > -1) {
      return mappingList[index];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export function getAllMappingsLocal(): Mapping[] | null {
  let local = localStorage.getItem("mappingList");
  if (local) {
    let mappingList = JSON.parse(local) as Mapping[]
    return mappingList;
  } else {
    return null;
  }
}

export function deleteMappingLocal(id: string) {
  let local = localStorage.getItem("mappingList");
  if (local) {
    let mappingList = JSON.parse(local) as Mapping[]
    let index = mappingList.findIndex((m) => m.id === id);
    if (index > -1) {
      mappingList.splice(index, 1);
      localStorage.setItem("mappingList", JSON.stringify(mappingList));
    }
  }
}
