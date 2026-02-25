import { useEffect, useRef } from 'react';
import './App.css';
import { SHOTCHART_SETTINGS, NBA_SETTINGS } from './lib/halfcourt/Constants';
import { drawCourt } from './lib/halfcourt/Utilities';

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const id = 'halfcourt';

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
    console.log(`Snapped to grid: x=${gx}, y=${gy}`);
  };

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
      <div className='halfcourt-container'>
        <svg ref={svgRef} width='100%' id={id} onMouseMove={handleMouseMove} />
      </div>
    </div>
  );
}

export default App;
