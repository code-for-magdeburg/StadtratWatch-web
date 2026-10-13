enum VoteType {
  Yes = 'J',
  No = 'N',
}

class Greeter {
  constructor(private readonly name: string) {}

  greet(): string {
    return `hello ${this.name}`;
  }
}

console.log(JSON.stringify({ enumValue: VoteType.No, parameterProperty: new Greeter('council').greet() }));
