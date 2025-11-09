import { OparlPapersRepository } from '../shared/oparl/oparl-papers-repository.ts';

export interface PaperGraphNode {
  id: number;
  superordinateIds: number[];
  subordinateIds: number[];
}

export interface PaperGraph {
  addPaper(paperId: number): void;
  addSubordinateRelationship(superordinatedPaperId: number, subordinatedPaperId: number): void;
  getConnectedPapers(paperId: number): number[];
  getRootPapersOfPaper(paperId: number): number[];
  getAllRootPapers(): number[];
}

export class PaperInMemoryGraph implements PaperGraph {
  private nodes: Map<number, PaperGraphNode> = new Map<number, PaperGraphNode>();

  public addPaper(paperId: number): void {
    if (this.nodes.has(paperId)) {
      throw new Error(`Paper with ID ${paperId} already exists in the graph.`);
    }

    this.nodes.set(
      paperId,
      { id: paperId, superordinateIds: [], subordinateIds: [] },
    );
  }

  public addSubordinateRelationship(superordinatedPaperId: number, subordinatedPaperId: number): void {
    if (superordinatedPaperId === subordinatedPaperId) {
      throw new Error('A paper cannot be subordinated to itself.');
    }

    if (!this.nodes.has(superordinatedPaperId)) {
      this.addPaper(superordinatedPaperId);
    }
    if (!this.nodes.has(subordinatedPaperId)) {
      this.addPaper(subordinatedPaperId);
    }

    const superordinateNode = this.nodes.get(superordinatedPaperId)!;
    if (superordinateNode.subordinateIds.includes(subordinatedPaperId)) {
      return;
    }

    if (this.hasPath(subordinatedPaperId, superordinatedPaperId)) {
      throw new Error(
        `Cannot add relationship: would create a cycle (${superordinatedPaperId} is already reachable from ${subordinatedPaperId})`,
      );
    }

    superordinateNode.subordinateIds.push(subordinatedPaperId);

    const subordinateNode = this.nodes.get(subordinatedPaperId)!;
    subordinateNode.superordinateIds.push(superordinatedPaperId);
  }

  public getConnectedPapers(paperId: number): number[] {
    const node = this.nodes.get(paperId);
    if (!node) {
      return [];
    }

    const visited = new Set<number>();
    const queue: number[] = [paperId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      const currentNode = this.nodes.get(currentId);
      if (currentNode) {
        queue.push(...currentNode.subordinateIds, ...currentNode.superordinateIds);
      }
    }

    return Array.from(visited);
  }

  public getRootPapersOfPaper(paperId: number): number[] {
    const connectedPapers = this.getConnectedPapers(paperId);
    const rootPapers: number[] = [];

    for (const id of connectedPapers) {
      const node = this.nodes.get(id);
      if (node && node.superordinateIds.length === 0) {
        rootPapers.push(id);
      }
    }

    return rootPapers;
  }

  public getAllRootPapers(): number[] {
    const rootPapers: number[] = [];

    for (const [id, node] of this.nodes) {
      if (node.superordinateIds.length === 0) {
        rootPapers.push(id);
      }
    }

    return rootPapers;
  }

  private hasPath(startId: number, targetId: number): boolean {
    const visited = new Set<number>();
    const queue: number[] = [startId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === targetId) {
        return true;
      }

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      const currentNode = this.nodes.get(currentId);
      if (currentNode) {
        queue.push(...currentNode.subordinateIds);
      }
    }

    return false;
  }
}

export function createInMemoryPaperGraph(papersRepository: OparlPapersRepository): PaperGraph {
  const graph = new PaperInMemoryGraph();

  const allPapers = papersRepository.getAllPapers().filter((paper) => !paper.deleted).map((paper) => ({
    paperId: +paper.id.split('/').pop()!,
    subordinatedPaperIds: (paper.superordinatedPaper || []).map((relatedPaperId) => +relatedPaperId.split('/').pop()!),
  }));

  allPapers.forEach((paper) => graph.addPaper(paper.paperId));

  for (const paper of allPapers) {
    paper.subordinatedPaperIds.forEach((subordinatedPaperId) =>
      graph.addSubordinateRelationship(paper.paperId, subordinatedPaperId)
    );
  }

  return graph;
}
