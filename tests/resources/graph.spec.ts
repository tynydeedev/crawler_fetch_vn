import graph from '../../src/resources/graph';
import logger from '../../src/log';

describe('Graph', () => {
  it('should return the empty graph', () => {
    expect(graph.getAdjacencyList()).toBeInstanceOf(Map);
  });

  it('should return the empty list of vertices', () => {
    expect(graph.getVertices()).toEqual([]);
  });

  it('should add a vertex to the graph', () => {
    graph.addVertex('a');
    expect(graph.getVertices()).toEqual(['a']);

    graph.addVertex('b');
    expect(graph.getVertices()).toEqual(['a', 'b']);
  });

  it('should add edge from a to b', () => {
    graph.addEdge('a', 'b', 'sample-key', 123);
    expect(graph.getAdjacencyList().get('a')).toEqual([{ to: 'b', 'sample-key': 123 }]);
    expect(graph.getAdjacent('a')).toEqual([{ to: 'b', 'sample-key': 123 }]);
  });

  it('should add vertex z and add edge from z to a', () => {
    graph.addEdge('z', 'a', 'sample-key', 123);
    expect(graph.getAdjacencyList().get('z')).toEqual([{ to: 'a', 'sample-key': 123 }]);
    expect(graph.getAdjacent('z')).toEqual([{ to: 'a', 'sample-key': 123 }]);
  });

  it('should update the edge from a to b', () => {
    graph.updateEdge('a', 'b', 'sample-key', 111);
    expect(graph.getAdjacencyList().get('a')).toEqual([{ to: 'b', 'sample-key': 111 }]);
    expect(graph.getAdjacent('a')).toEqual([{ to: 'b', 'sample-key': 111 }]);
  });

  it('should create vertex c and add edge from c to b', () => {
    graph.updateEdge('c', 'b', 'SampleKey', 999);
    expect(graph.getAdjacencyList().get('c')).toEqual([{ to: 'b', SampleKey: 999 }]);
    expect(graph.getAdjacent('c')).toEqual([{ to: 'b', SampleKey: 999 }]);
  });

  it('should do a double updateEdge', () => {
    graph.updateRelation(
      { baseAsset: 'aaa', quoteAsset: 'bbb' },
      { bestBid: '1.2', bestAsk: '1.3' },
    );
    expect(graph.getAdjacent('aaa')).toEqual([{ to: 'bbb', bid: 1.2 }]);
    expect(graph.getAdjacent('bbb')).toEqual([{ to: 'aaa', ask: 1.3 }]);
  });

  describe('traverse', () => {
    const loggerSpy = jest.spyOn(logger, 'addLog');

    beforeAll(() => {
      graph.updateRelation(
        { baseAsset: 'ETH', quoteAsset: 'BTC' },
        { bestAsk: '1.3', bestBid: '1.2' },
      );
      graph.updateRelation(
        { baseAsset: 'BTC', quoteAsset: 'USDT' },
        { bestBid: '25500', bestAsk: '25600' },
      );
      graph.updateRelation(
        { baseAsset: 'ETH', quoteAsset: 'USDT' },
        { bestBid: '1850', bestAsk: '1970' },
      );
    });

    beforeEach(() => loggerSpy.mockClear());

    it('should log the triangle arbitrage oppotunity with ETH', async () => {
      await graph.traverse('ETH');
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy.mock.calls[0][0]).toContain(
        'ETH - sell(1.2) -> BTC - sell(25500) -> USDT - buy(1970) -> ETH. Profit rate:',
      );
    });

    it('should log the triangle arbitrage oppotunity with BTC', async () => {
      await graph.traverse('BTC');
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy.mock.calls[0][0]).toContain(
        'BTC - sell(25500) -> USDT - buy(1970) -> ETH - sell(1.2) -> BTC. Profit rate:',
      );
    });

    it('should log the triangle arbitrage oppotunity with USDT', async () => {
      await graph.traverse('USDT');
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy.mock.calls[0][0]).toContain(
        'USDT - buy(1970) -> ETH - sell(1.2) -> BTC - sell(25500) -> USDT. Profit rate:',
      );
    });
  });
});
