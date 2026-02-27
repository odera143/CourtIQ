import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { SHOTCHART_SETTINGS, NBA_SETTINGS } from './lib/halfcourt/Constants';
import { drawCourt } from './lib/halfcourt/Utilities';
import type { HoverState, ShotData } from './lib/halfcourt/Interfaces';
import ShotTooltip from './components/ShotTooltip';
import UserForm from './components/UserForm';
import { useQuery } from '@tanstack/react-query';

function App() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [params, setParams] = useState<any>(null);
  const id = 'halfcourt';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shotgrid'],
    enabled: false,
    queryFn: () =>
      fetch(
        `http://127.0.0.1:8000/api/shotgrid?${new URLSearchParams(params)}`,
      ).then((res) => res.json()),
  });

  useEffect(() => {
    if (params) {
      console.log('params changed:', new URLSearchParams(params));
      refetch();
    }
  }, [params]);

  const cellMap = useMemo(() => {
    if (!data) return new Map<string, ShotData>();
    console.log(data);
    const m = new Map<string, ShotData>();
    for (const c of data.cells) {
      m.set(`${c.x}:${c.y}`, c);
    }
    return m;
  }, [data]);

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

    const gx = snapToGrid(x_ft, 5);
    const gy = snapToGrid(y_ft, 5);

    const cell = cellMap.get(`${gx}:${gy}`) ?? null;
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
      <UserForm onSubmit={(params) => setParams(params)} />
      <div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading shot data</p>}
        <div ref={containerRef} className='halfcourt-container'>
          <svg
            ref={svgRef}
            width='100%'
            id={id}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          {hover && <ShotTooltip hover={hover} />}
        </div>
      </div>
    </div>
  );
}

export default App;
