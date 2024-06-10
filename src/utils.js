const extractTextFromHtml = (str) => {
  const regex = />([^<]+)</;
  const match = str.match(regex);
  return match ? match[1] : str;
};

class UniqueIDGenerator {
  constructor() {
    this.currentID = 0;
  }

  generateID() {
    this.currentID += 1;
    return this.currentID;
  }
}

const uniqueIDGenerator = new UniqueIDGenerator();

export { uniqueIDGenerator, extractTextFromHtml };
