import logger from '../log';

interface Edge {
  [key: string]: any;
  to: string;
}

class Graph {
  private adjacencyList: Map<string, Array<Edge>>;

  constructor() {
    this.adjacencyList = new Map<string, Array<Edge>>();
  }

  getAdjacencyList(): Map<string, Array<Edge>> {
    return this.adjacencyList;
  }

  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  addVertex(vertex: string) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(from: string, to: string, key: string, value: number) {
    if (!this.adjacencyList.has(from)) {
      this.addVertex(from);
    }
    this.adjacencyList.get(from)?.push({
      to,
      [key]: value,
    });
  }

  updateEdge(from: string, to: string, key: string, value: number) {
    if (!this.adjacencyList.has(from)) {
      this.addVertex(from);
    }
    const edge = this.adjacencyList.get(from)?.find((edge) => edge.to === to && edge[key]);
    if (edge) {
      edge[key] = value;
    } else {
      this.addEdge(from, to, key, value);
    }
  }

  updateRelation(
    symbol: { baseAsset: string; quoteAsset: string },
    ticker: { bestBid: string; bestAsk: string },
  ) {
    this.updateEdge(symbol.baseAsset, symbol.quoteAsset, 'bid', parseFloat(ticker.bestBid));
    this.updateEdge(symbol.quoteAsset, symbol.baseAsset, 'ask', parseFloat(ticker.bestAsk));
  }

  getAdjacent(vertex: string): Edge[] {
    return this.adjacencyList.get(vertex) || [];
  }

  /**
   * Traverses the graph and returns all the triangle arbitrage opportunities of the starting vertex.
   * This function is promisified to avoid blocking the main thread.
   *
   * @param vertex starting vertex
   * @returns List of triangle arbitrage opportunities available for the given vertex
   */
  async traverse(vertex: string) {
    const possibilities: Array<Array<string>> = [];

    this.traverseUtil(vertex, possibilities);

    for (const possibility of possibilities) {
      let log = '';
      let profit = 1;

      for (let i = 0; i < possibility.length; i++) {
        const symbol = possibility[i];
        const nextSymbol = possibility[i + 1];

        if (nextSymbol) {
          const edge = this.getAdjacent(symbol).find((edge) => edge.to === nextSymbol) as Edge;

          // Rate is determined by the price. If it's a bid price, it means we're selling.
          // Otherwise, it means we're buying.
          const rate = edge.bid ? edge.bid : 1 / edge.ask;
          profit *= rate;

          log += `${i === 0 ? '' : '-> '}${symbol} - ${edge.bid ? 'sell' : 'buy'}(${
            edge.bid || edge.ask
          }) `;
        } else {
          log += `-> ${possibility[i]}. Profit rate: ${profit.toFixed(8)}`;
        }
      }

      if (profit > 1) {
        void logger.addLog(log);
      }
    }

    return possibilities;
  }

  traverseUtil(vertex: string, possibilities: Array<Array<string>>, visited: string[] = []) {
    visited.push(vertex);

    // We only want to traverse maximum 4 steps as we're trying to detect triangle arbitrage opportunities
    if (visited.length > 4) {
      return;
    }

    if (visited.length === 4 && vertex === visited[0]) {
      possibilities.push(visited);
      return;
    }

    for (const edge of this.getAdjacent(vertex)) {
      if (!visited.includes(edge.to) || visited.length === 3) {
        this.traverseUtil(edge.to, possibilities, [...visited]);
      }
    }
  }
}

export default new Graph();
