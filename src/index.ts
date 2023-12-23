import {
  Canister,
  Record,
  StableBTreeMap,
  Vec,
  Void,
  query,
  text,
  update,
} from "azle";

const Document = Record({
  id: text,
  name: text,
});

let Documents = StableBTreeMap<text, Document>(0);

export default Canister({
  addDocument: update([text], Void, (name) => {
    const newDocument: Document = {
      id: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      name: name,
    };
    Documents.insert(newDocument.id, newDocument);
  }),

  findDocuments: query([text], Vec(Document), (keyword) => {
    return Documents.values().filter((value) => value.name.includes(keyword));
  }),

  getDocuments: query([], Vec(Document), () => {
    return Documents.values();
  }),
});
