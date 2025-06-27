export class Container {
  private dependencies: Map<string, any> = new Map();

  public register(name: string, instance: any): void {
    this.dependencies.set(name, instance);
  }

  public get<T>(name: string): T {
    if (!this.dependencies.has(name)) {
      throw new Error(`Dependency ${name} not registered`);
    }
    return this.dependencies.get(name);
  }
}