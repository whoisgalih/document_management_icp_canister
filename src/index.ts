import {
  Record,
  StableBTreeMap,
  Vec,
  ic,
  $query,
  $update,
  Result,
  nat64,
  Opt,
  match,
} from "azle";
import { v4 as uuidv4 } from "uuid";

// Define the structure of a document
type Document = Record<{
  id: string;
  name: string;
  description: string;
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

// Define the payload structure for creating or updating a document
type DocumentPayload = Record<{
  name: string;
  description: string;
}>;

// Create a stable B-tree map to store documents
const Documents = new StableBTreeMap<string, Document>(0, 44, 1024);

// Function to add a new document
$update
export function addDocument(payload: DocumentPayload): Result<Document, string> {
  // Payload Validation: Ensure that required fields are present in the payload
  if (!payload.name || !payload.description) {
    return Result.Err<Document, string>("Invalid payload");
  }

  try {
    // ID Validation: Ensure that the generated ID is a non-empty string
    const newDocument: Document = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      createdAt: ic.time(),
      updatedAt: Opt.None,
    };

    // Insert the new document into the storage
    Documents.insert(newDocument.id, newDocument);
    return Result.Ok(newDocument);
  } catch (error) {
    // Error Handling: Capture and return an error if document creation fails
    return Result.Err(`Error adding document: ${error}`);
  }
}

// Function to get all documents
$query
export function getDocuments(): Result<Vec<Document>, string> {
  try {
    // Error Handling: Implement a try-catch block to manage potential errors
    const documents = Documents.values();
    return Result.Ok(documents);
  } catch (error) {
    return Result.Err(`Error getting documents: ${error}`);
  }
}

// Function to find documents containing a specific keyword
$query
export function findDocuments(keyword: string): Result<Vec<Document>, string> {
  // Parameter Validation: Ensure that the keyword is a non-empty string
  if (typeof keyword !== 'string' || keyword.trim() === '') {
    return Result.Err('Invalid keyword');
  }

  try {
    // Error Handling: Implement a try-catch block to manage potential errors
    const filteredDocuments = Documents.values().filter((value) =>
      value.name.includes(keyword)
    );
    return Result.Ok(filteredDocuments);
  } catch (error) {
    return Result.Err(`Error finding documents: ${error}`);
  }
}

// Function to delete a document by ID
$update
export function deleteDocument(id: string): Result<Document, string> {
  // Parameter Validation: Ensure that the ID is provided
  if (!id) {
    return Result.Err<Document, string>("Invalid ID provided.");
  }

  return match(Documents.get(id), {
    Some: (foundDocument) => {
      // Remove the document from the storage
      Documents.remove(id);
      return Result.Ok<Document, string>(foundDocument);
    },
    None: () => Result.Err<Document, string>(`Document with ID=${id} not found.`),
  });
}

// Cryptographic utility for generating random values
globalThis.crypto = {
  // @ts-ignore
  getRandomValues: () => {
    let array = new Uint8Array(32);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
};
