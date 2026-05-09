import { createTools, AgentWorldState } from "../tools";

describe("createTools", () => {
  const worldState: AgentWorldState = {
    blocks: [{ pos: [0, 0, 0], type: "grass" }],
    entities: [{ id: "sheep_1", type: "sheep", pos: [2, 0, 2], health: 100 }],
    inventory: { wood: 5, stone: 2 },
    position: [0, 1, 0],
    stats: { hunger: 80, energy: 100, happiness: 100 },
  };

  it("should have observation tools", async () => {
    const tools = createTools(worldState);

    const checkSelf = tools.find((t) => t.name === "check_self");
    expect(checkSelf).toBeDefined();
    const selfInfo = await checkSelf?.func("");
    expect(selfInfo).toContain("Hunger: 80%");
    expect(selfInfo).toContain("wood: 5");

    const lookAround = tools.find((t) => t.name === "look_around");
    expect(lookAround).toBeDefined();
    const surroundings = await lookAround?.func("");
    expect(surroundings).toContain("grass");

    const search = tools.find((t) => t.name === "search");
    expect(search).toBeDefined();
    const animalResult = await search?.func("animal");
    expect(animalResult).toContain("sheep");
  });

  it("should have survival tools", async () => {
    const tools = createTools(worldState);

    const cutTree = tools.find(t => t.name === "cut_tree");
    expect(cutTree).toBeDefined();
    expect(await cutTree?.func("10, 0, 5")).toBe("ACTION: cut_tree(10, 0, 5)");

    const hunt = tools.find(t => t.name === "hunt");
    expect(hunt).toBeDefined();
    expect(await hunt?.func("sheep_1")).toBe("ACTION: hunt(sheep_1)");

    const cook = tools.find(t => t.name === "cook");
    expect(cook).toBeDefined();
    expect(await cook?.func("")).toBe("ACTION: cook()");
  });

  it("should have building tools", async () => {
    const tools = createTools(worldState);

    const build = tools.find(t => t.name === "build");
    expect(build).toBeDefined();
    expect(await build?.func("house")).toBe("ACTION: build(house)");
    expect(await build?.func("campfire")).toBe("ACTION: build(campfire)");
    expect(await build?.func("tower")).toBe("ACTION: build(tower)");

    const invalidResult = await build?.func("spaceship");
    expect(invalidResult).toContain("ERROR");
  });

  it("should have craft tool", async () => {
    const tools = createTools(worldState);

    const craft = tools.find(t => t.name === "craft");
    expect(craft).toBeDefined();
    expect(await craft?.func("plank")).toBe("ACTION: craft(plank, 1)");
    expect(await craft?.func("plank, 3")).toBe("ACTION: craft(plank, 3)");

    const invalidResult = await craft?.func("diamond_sword");
    expect(invalidResult).toContain("ERROR");
  });

  it("should have gather tool", async () => {
    const tools = createTools(worldState);

    const gather = tools.find(t => t.name === "gather");
    expect(gather).toBeDefined();
    expect(await gather?.func("mine_stone, 5, 0, 3")).toBe("ACTION: gather(mine_stone, 5, 0, 3)");

    const invalidResult = await gather?.func("mine_diamonds, 0, 0, 0");
    expect(invalidResult).toContain("ERROR");
  });

  it("should have demolish and terraform tools", async () => {
    const tools = createTools(worldState);

    const demolish = tools.find(t => t.name === "demolish");
    expect(demolish).toBeDefined();
    expect(await demolish?.func("0, 0, 0, 4, 3, 4")).toBe("ACTION: demolish(0, 0, 0, 4, 3, 4)");

    const terraform = tools.find(t => t.name === "terraform");
    expect(terraform).toBeDefined();
    expect(await terraform?.func("flatten, -5, -5, 5, 5, 2")).toBe("ACTION: terraform(flatten, -5, -5, 5, 5, 2)");
  });

  it("should have remove_block tool", async () => {
    const tools = createTools(worldState);
    const removeBlock = tools.find(t => t.name === "remove_block");
    expect(removeBlock).toBeDefined();
    expect(await removeBlock?.func("5, 1, 3")).toBe("ACTION: remove_block(5, 1, 3)");
  });

  it("should have list_blueprints tool", async () => {
    const tools = createTools(worldState);
    const listBp = tools.find(t => t.name === "list_blueprints");
    expect(listBp).toBeDefined();
    const result = await listBp?.func("");
    expect(result).toContain("house");
    expect(result).toContain("tower");
    expect(result).toContain("campfire");
  });

  it("should have save_learning tool", async () => {
    const tools = createTools(worldState);
    const saveLearning = tools.find(t => t.name === "save_learning");
    expect(saveLearning).toBeDefined();
    const result = await saveLearning?.func("trees give wood");
    expect(result).toContain("LEARNING SAVED");
  });

  it("should return defaults when worldState is missing", async () => {
    const tools = createTools();
    const checkSelf = tools.find((t) => t.name === "check_self");
    const info = await checkSelf?.func("");
    expect(info).toContain("Hunger: 100%");

    const lookAround = tools.find((t) => t.name === "look_around");
    const around = await lookAround?.func("");
    expect(around).toContain("flat grass world");
  });
});
