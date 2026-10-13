
class Greeter {
  constructor(private readonly name: string) {}

  greet(): string {
    return `hello ${this.name}`;
  }
}

console.log(JSON.stringify({ enumValue: "N", parameterProperty: new Greeter('council').greet() }));
