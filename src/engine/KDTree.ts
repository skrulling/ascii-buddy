import { KDPoint } from './types';

class KDNode {
  point: number[];
  char: string;
  left: KDNode | null = null;
  right: KDNode | null = null;
  axis: number;

  constructor(point: number[], char: string, axis: number) {
    this.point = point;
    this.char = char;
    this.axis = axis;
  }
}

export class KDTree {
  private root: KDNode | null = null;
  private dimensions: number;

  constructor(points: KDPoint[], dimensions: number) {
    this.dimensions = dimensions;
    this.root = this.buildTree([...points], 0);
  }

  private buildTree(points: KDPoint[], depth: number): KDNode | null {
    if (points.length === 0) return null;

    const axis = depth % this.dimensions;
    points.sort((a, b) => a.point[axis] - b.point[axis]);

    const median = Math.floor(points.length / 2);
    const node = new KDNode(
      points[median].point,
      points[median].char,
      axis
    );
    node.left = this.buildTree(points.slice(0, median), depth + 1);
    node.right = this.buildTree(points.slice(median + 1), depth + 1);

    return node;
  }

  nearest(target: number[]): string {
    const best = { node: null as KDNode | null, distance: Infinity };
    this.nearestSearch(this.root, target, best);
    return best.node?.char ?? ' ';
  }

  private nearestSearch(
    node: KDNode | null,
    target: number[],
    best: { node: KDNode | null; distance: number }
  ): void {
    if (!node) return;

    const distance = this.euclideanDistance(node.point, target);
    if (distance < best.distance) {
      best.distance = distance;
      best.node = node;
    }

    const axis = node.axis;
    const diff = target[axis] - node.point[axis];
    const closer = diff < 0 ? node.left : node.right;
    const further = diff < 0 ? node.right : node.left;

    this.nearestSearch(closer, target, best);

    if (Math.abs(diff) < best.distance) {
      this.nearestSearch(further, target, best);
    }
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}
