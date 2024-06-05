class UniqueIDGenerator {
  constructor() {
    this.currentID = 0;
  }

  generateID() {
    return this.currentID++;
  }
}

const uniqueIDGenerator = new UniqueIDGenerator();

export default uniqueIDGenerator;
