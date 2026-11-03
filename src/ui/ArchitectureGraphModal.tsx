import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  GAME_ARCHITECTURE_LINKS,
  GAME_ARCHITECTURE_NODES,
  ModuleLink,
  ModuleNode,
} from '../game/villagers';
import { ValleyState } from '../game/types';

export interface ArchitectureGraphViewProps {
  valley: ValleyState;
  isModal?: boolean;
  onClose?: () => void;
}

interface SimNode extends d3.SimulationNodeDatum, ModuleNode {
  x: number;
  y: number;
  targetY: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  importedSymbols: string[];
  dataFlowLabel: string;
  isCoreGameDir: boolean;
}

export const ArchitectureGraphView: React.FC<ArchitectureGraphViewProps> = ({
  valley,
  isModal = false,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('src/game/tick.ts');
  const [filterMode, setFilterMode] = useState<'all' | 'game_only'>('all');

  const selectedNode =
    GAME_ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) || GAME_ARCHITECTURE_NODES[6];

  const incomingLinks = GAME_ARCHITECTURE_LINKS.filter((l) => l.target === selectedNodeId);
  const outgoingLinks = GAME_ARCHITECTURE_LINKS.filter((l) => l.source === selectedNodeId);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = 680;
    const height = isModal ? 420 : 210;

    const rawNodes = GAME_ARCHITECTURE_NODES.filter(
      (n) => filterMode === 'all' || n.folder === 'src/game'
    );
    const layerCounts: Record<number, number> = {};
    const layerIndices: Record<number, number> = {};
    rawNodes.forEach((n) => {
      layerCounts[n.layer] = (layerCounts[n.layer] || 0) + 1;
      layerIndices[n.layer] = 0;
    });

    const filteredNodes: Array<SimNode & { targetY: number }> = rawNodes.map((n) => {
      const idxInLayer = layerIndices[n.layer]++;
      const countInLayer = layerCounts[n.layer];
      const usableH = height - 56;
      const stepY = usableH / (countInLayer + 1);
      const targetY = 34 + stepY * (idxInLayer + 1);
      return {
        ...n,
        x: 95 + n.layer * 165,
        y: targetY,
        targetY,
      };
    });

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks: SimLink[] = GAME_ARCHITECTURE_LINKS.filter(
      (l) => nodeIds.has(l.source) && nodeIds.has(l.target)
    ).map((l: ModuleLink) => ({ ...l }));

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // Define arrow markers and glow gradients
    const defs = svg.append('defs');

    defs
      .append('marker')
      .attr('id', 'd3-arrow-core')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f0b429');

    defs
      .append('marker')
      .attr('id', 'd3-arrow-ext')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38bdf8');

    const rootG = svg.append('g');

    // Layer column headers
    const layerTitles = [
      { layer: 0, label: 'L0 · Schema & Config' },
      { layer: 1, label: 'L1 · Domain Logic' },
      { layer: 2, label: 'L2 · Pure Simulation' },
      { layer: 3, label: 'L3 · Tests & Consumers' },
    ];

    rootG
      .selectAll('.layer-label')
      .data(layerTitles)
      .enter()
      .append('text')
      .attr('x', (d) => 95 + d.layer * 165)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#b89f80')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d) => d.label);

    // Directed dependency links
    const linkElements = rootG
      .append('g')
      .selectAll('path')
      .data(filteredLinks)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const sId = typeof d.source === 'string' ? d.source : d.source.id;
        const tId = typeof d.target === 'string' ? d.target : d.target.id;
        if (sId === selectedNodeId || tId === selectedNodeId) {
          return d.isCoreGameDir ? '#f0b429' : '#38bdf8';
        }
        return 'rgba(200, 125, 50, 0.28)';
      })
      .attr('stroke-width', (d) => {
        const sId = typeof d.source === 'string' ? d.source : d.source.id;
        const tId = typeof d.target === 'string' ? d.target : d.target.id;
        return sId === selectedNodeId || tId === selectedNodeId ? 2.4 : 1.3;
      })
      .attr('stroke-dasharray', (d) => (d.isCoreGameDir ? 'none' : '4,3'))
      .attr('marker-end', (d) =>
        d.isCoreGameDir ? 'url(#d3-arrow-core)' : 'url(#d3-arrow-ext)'
      );

    // Module Nodes
    const nodeGroups = rootG
      .append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedNodeId(d.id);
      });

    // Drag behavior via d3.drag
    const simulation = d3
      .forceSimulation<SimNode & { targetY: number }>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode & { targetY: number }, SimLink>(filteredLinks)
          .id((d) => d.id)
          .distance(135)
          .strength(0.15)
      )
      .force('charge', d3.forceManyBody().strength(-90))
      .force(
        'x',
        d3
          .forceX<SimNode & { targetY: number }>((d) => 95 + d.layer * 165)
          .strength(0.95)
      )
      .force(
        'y',
        d3.forceY<SimNode & { targetY: number }>((d) => d.targetY).strength(0.9)
      )
      .force('collide', d3.forceCollide(38));

    const dragBehavior = d3
      .drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = Math.max(45, Math.min(width - 45, event.x));
        d.fy = Math.max(28, Math.min(height - 22, event.y));
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeGroups.call(dragBehavior);

    // Outer Amazigh diamond / rounded badge per module
    nodeGroups
      .append('rect')
      .attr('x', -56)
      .attr('y', -18)
      .attr('width', 112)
      .attr('height', 36)
      .attr('rx', 6)
      .attr('fill', (d) => {
        if (d.id === selectedNodeId) return '#c87d32';
        return d.folder === 'src/game' ? '#241911' : '#16263b';
      })
      .attr('stroke', (d) => {
        if (d.id === selectedNodeId) return '#fde68a';
        return d.folder === 'src/game' ? '#f0b429' : '#38bdf8';
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 2.5 : 1.5));

    // File name label
    nodeGroups
      .append('text')
      .attr('y', -2)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.id === selectedNodeId ? '#18120e' : '#f4ead5'))
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .text((d) => d.id.replace('src/game/', '').replace('src/render/', '').replace('src/', ''));

    // Folder / role sub-label
    nodeGroups
      .append('text')
      .attr('y', 11)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.id === selectedNodeId ? '#2d1e12' : '#d4b895'))
      .attr('font-size', '8.5px')
      .text((d) => (d.folder === 'src/game' ? 'src/game/' : d.folder));

    simulation.on('tick', () => {
      linkElements.attr('d', (d) => {
        const src = d.source as SimNode;
        const tgt = d.target as SimNode;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.4;
        return `M${src.x},${src.y}A${dr},${dr} 0 0,1 ${tgt.x},${tgt.y}`;
      });

      nodeGroups.attr('transform', (d) => {
        const cx = Math.max(58, Math.min(width - 58, d.x));
        const cy = Math.max(32, Math.min(height - 22, d.y));
        d.x = cx;
        d.y = cy;
        return `translate(${cx},${cy})`;
      });
    });

    return () => {
      simulation.stop();
    };
  }, [selectedNodeId, filterMode, isModal]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
      {/* Left 2 Columns: Interactive D3.js Force-Directed Module Dependency Graph */}
      <div className="lg:col-span-2 bg-[#140e0a] border border-[#c87d32]/50 rounded p-2.5 flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#f0b429]">
              D3.js Module Dependency & Data Flow Map (`src/game/`)
            </span>
            <span className="text-[10px] text-[#b89f80]">
              (Drag nodes or click any module to inspect imports)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#c87d32] text-[#18120e] font-semibold'
                  : 'bg-[#261b13] text-[#d4b895]'
              }`}
            >
              Full Pipeline (10)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('game_only')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                filterMode === 'game_only'
                  ? 'bg-[#c87d32] text-[#18120e] font-semibold'
                  : 'bg-[#261b13] text-[#d4b895]'
              }`}
            >
              `src/game/` Only (8)
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-0.5 bg-[#3b281c] hover:bg-[#4f3626] text-[#f4ead5] rounded text-[10px] cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 680 ${isModal ? 420 : 210}`}
          className="w-full h-auto bg-[#0f0a07] rounded border border-[#c87d32]/25"
          aria-label="D3.js Module Dependency Graph of src/game/"
        />
      </div>

      {/* Right Column: Selected Module Inspector & Live Data Flow Telemetry */}
      <div className="bg-[#221811] border border-[#c87d32]/50 rounded p-3 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between gap-2 border-b border-[#c87d32]/30 pb-1.5">
            <span className="font-mono-num font-bold text-xs text-[#f0b429]">
              {selectedNode.file}
            </span>
            <span className="text-[10px] text-[#34d399] font-mono-num">
              {selectedNode.liveMetricLabel ? selectedNode.liveMetricLabel(valley) : ''}
            </span>
          </div>

          <p className="text-[11px] text-[#e6d5b8] mt-1.5 leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="mt-2">
            <div className="text-[10px] font-semibold text-[#d4a359]">Exported API Symbols:</div>
            <div className="mt-1 flex flex-wrap gap-1 font-mono-num text-[10px] text-[#f4ead5]">
              {selectedNode.exportsList.map((sym) => (
                <span key={sym} className="px-1.5 py-0.5 bg-[#140e0a] border border-[#c87d32]/30 rounded">
                  {sym}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[#c87d32]/25 text-[10px]">
          <div>
            <div className="font-semibold text-[#f0b429]">Imports From ({incomingLinks.length}):</div>
            {incomingLinks.length === 0 ? (
              <div className="text-[#8c7862]">Zero dependencies (Root leaf)</div>
            ) : (
              incomingLinks.map((l) => (
                <div key={`${l.source}->${l.target}`} className="text-[#d4b895] truncate">
                  ← {l.source.replace('src/game/', '')} ({l.dataFlowLabel})
                </div>
              ))
            )}
          </div>
          <div>
            <div className="font-semibold text-[#38bdf8]">Feeds Data To ({outgoingLinks.length}):</div>
            {outgoingLinks.length === 0 ? (
              <div className="text-[#8c7862]">Terminal consumer</div>
            ) : (
              outgoingLinks.map((l) => (
                <div key={`${l.source}->${l.target}`} className="text-[#d4b895] truncate">
                  → {l.target.replace('src/game/', '')}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
