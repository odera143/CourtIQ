import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { SHOTCHART_SETTINGS, NBA_SETTINGS } from './lib/halfcourt/Constants';
import { drawCourt } from './lib/halfcourt/Utilities';
import * as data from './test-data/curry_2023.json';
import type { HoverState, ShotData } from './lib/halfcourt/Interfaces';
import ShotTooltip from './components/ShotTooltip';

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const id = 'halfcourt';

  const cellMap = useMemo(() => {
    const m = new Map<string, ShotData>();
    for (const c of data.cells) m.set(`${c.x}:${c.y}`, c);
    return m;
  }, [data.cells]);

  useEffect(() => {
    let svg = document.getElementById(id);
    if (svg) svg.innerHTML = '';
    const chartSettings = SHOTCHART_SETTINGS(NBA_SETTINGS, 1);
    drawCourt(chartSettings, svgRef);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const p = getSvgPoint(svg, e.clientX, e.clientY);
    if (!p) return;

    const x_ft = p.x;
    const y_ft = p.y;

    const gx = snapToGrid(x_ft, 1);
    const gy = snapToGrid(y_ft, 1);

    const cell = cellMap.get(`${gx},${gy}`) ?? null;
    setHover({
      clientX: e.clientX,
      clientY: e.clientY,
      gx,
      gy,
      cell,
    });
  };

  const handleMouseLeave = () => setHover(null);

  const getSvgPoint = (
    svg: SVGSVGElement,
    clientX: number,
    clientY: number,
  ) => {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = svg.getScreenCTM();
    if (!ctm) return null;

    // Convert from screen space -> SVG space
    const svgP = pt.matrixTransform(ctm.inverse());
    return { x: svgP.x, y: svgP.y }; // in feet
  };

  const snapToGrid = (value: number, gridFt: number) => {
    return Math.round(value / gridFt) * gridFt;
  };

  return (
    <div className='container'>
      <div className='settings-container'>
        <input placeholder='enter player'></input>
        <input placeholder='enter season'></input>
      </div>
      <div ref={containerRef} className='halfcourt-container'>
        <svg
          ref={svgRef}
          width='100%'
          id={id}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {hover && <ShotTooltip hover={hover} containerRef={containerRef} />}
      </div>
    </div>
  );
}

export default App;
