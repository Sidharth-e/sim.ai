import { createTools } from "../tools";

describe("createTools", () => {
  const worldState = {
    blocks: [{ x: 0, y: 0, z: 0, type: "grass" }],
    entities: [{ id: "sheep_1", type: "sheep", x: 2, y: 0, z: 2 }],
    inventory: ["wood"],
    position: { x: 0, y: 1, z: 0 },
  };

  it("should create tools with worldState", async () => {
    const tools = createTools(worldState);
    const get_world_info = tools.find((t) => t.name === "get_world_info");
    expect(get_world_info).toBeDefined();

    const info = await get_world_info?.func("");
    expect(info).toContain("Blocks: " + JSON.stringify(worldState.blocks));
    expect(info).toContain("Entities: " + JSON.stringify(worldState.entities));
    expect(info).toContain("Inventory: " + JSON.stringify(worldState.inventory));
    expect(info).toContain("Current Position: " + JSON.stringify(worldState.position));
  });

  it("should have new survival tools", async () => {
    const tools = createTools(worldState);
    
    const cutTree = tools.find(t => t.name === "cut_tree");
    expect(cutTree).toBeDefined();
    expect(await cutTree?.func("10, 0, 5")).toBe("ACTION: cut_tree(10, 0, 5)");

    const hunt = tools.find(t => t.name === "hunt");
    expect(hunt).toBeDefined();
    expect(await hunt?.func("sheep_1")).toBe("ACTION: hunt(sheep_1)");

    const build = tools.find(t => t.name === "build");
    expect(build).toBeDefined();
    expect(await build?.func("campfire")).toBe("ACTION: build(campfire)");

    const cook = tools.find(t => t.name === "cook");
    expect(cook).toBeDefined();
    expect(await cook?.func("")).toBe("ACTION: cook()");
  });

  it("should return default info when worldState is missing", async () => {
    const tools = createTools();
    const get_world_info = tools.find((t) => t.name === "get_world_info");
    const info = await get_world_info?.func("");
    expect(info).toBe("The world is a 3D voxel grid. There is a grass block at 0,0,0. You are currently at 0,1,0.");
  });
});
