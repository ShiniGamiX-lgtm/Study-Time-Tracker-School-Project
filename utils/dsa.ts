import { SubjectSummary } from '../types';

/**
 * LINEAR SEARCH ALGORITHM
 * Used to find if a subject already exists in our unsorted list.
 * Time Complexity: O(n)
 */
export const linearSearch = (
  list: SubjectSummary[],
  subjectName: string
): number => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].subject.toLowerCase() === subjectName.toLowerCase()) {
      return i;
    }
  }
  return -1;
};

/**
 * MAX HEAP CLASS
 * Used to efficiently keep track of the subject with the most study time.
 */
export class MaxHeap {
  heap: SubjectSummary[];

  constructor() {
    this.heap = [];
  }

  // Helper to get parent index
  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  // Helper to get left child index
  private left(i: number): number {
    return 2 * i + 1;
  }

  // Helper to get right child index
  private right(i: number): number {
    return 2 * i + 2;
  }

  // Swap two elements
  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * HEAPIFY ALGORITHM
   * Maintains the max-heap property for a subtree rooted at index i.
   * Time Complexity: O(log n)
   */
  public heapify(i: number): void {
    const left = this.left(i);
    const right = this.right(i);
    let largest = i;

    // Compare with left child
    if (
      left < this.heap.length &&
      this.heap[left].totalMinutes > this.heap[largest].totalMinutes
    ) {
      largest = left;
    }

    // Compare with right child
    if (
      right < this.heap.length &&
      this.heap[right].totalMinutes > this.heap[largest].totalMinutes
    ) {
      largest = right;
    }

    // If largest is not root
    if (largest !== i) {
      this.swap(i, largest);
      // Recursively heapify the affected sub-tree
      this.heapify(largest);
    }
  }

  /**
   * BUILD MAX HEAP
   * Converts an arbitrary array into a Max Heap.
   * Time Complexity: O(n)
   */
  public buildHeap(array: SubjectSummary[]): void {
    this.heap = [...array]; // Copy array
    // Start from the last non-leaf node and heapify down
    const startIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      this.heapify(i);
    }
  }

  /**
   * INSERT
   * Adds a new element to the heap.
   * Time Complexity: O(log n)
   */
  public insert(item: SubjectSummary): void {
    this.heap.push(item);
    let i = this.heap.length - 1;

    // Fix the min heap property if it is violated
    while (i > 0 && this.heap[this.parent(i)].totalMinutes < this.heap[i].totalMinutes) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  /**
   * EXTRACT MAX
   * Removes and returns the maximum element (root).
   * Time Complexity: O(log n)
   */
  public extractMax(): SubjectSummary | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapify(0);

    return root;
  }

  /**
   * GET SORTED LIST
   * Returns a sorted array by repeatedly extracting max.
   * NOTE: This consumes the heap instance.
   * Time Complexity: O(n log n)
   */
  public getSortedList(): SubjectSummary[] {
    const sorted: SubjectSummary[] = [];
    const tempHeap = new MaxHeap();
    tempHeap.heap = [...this.heap]; // Work on a copy to preserve original if needed elsewhere
    
    // We actually need to sort *this* instance's data or a copy. 
    // Since we want to display the heap structure usually, we might not want to drain it.
    // But for "sorting results" as requested:
    while (tempHeap.heap.length > 0) {
      const max = tempHeap.extractMax();
      if (max) sorted.push(max);
    }
    return sorted;
  }
}