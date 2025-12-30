'use client'

import { createShapeId, Tldraw, useEditor} from 'tldraw'
import 'tldraw/tldraw.css'
import { useState } from 'react'

//Child component of tldraw which gets coordinates of drawing
function AnalyzeButton(){
  const editor = useEditor()
  const [isLoading, setIsLoading] = useState(false)

  const sendToBackend = async (blob: Blob) =>{
    const formData = new FormData();
    formData.append('file', blob, 'drawing.png');
    try {
      const response = await fetch('http://localhost:8000/process-drawing', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      return JSON.parse(data.ai_reply)

    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to send to backend.");
    }
  }

  const handleSnapshot = async() => {
    setIsLoading(true)
    try{

      const shapeIds = editor.getCurrentPageShapeIds()
			if (shapeIds.size === 0) {
				alert('Draw something first!')
				setIsLoading(false)
				return
			}

      const selectionBounds = editor.getSelectionPageBounds() || editor.getCurrentPageBounds()
        if (!selectionBounds) throw new Error("Could not find drawing bounds")
      
      const result = await editor.toImage([...shapeIds], {
        format: 'png',
        background: false,
        scale: 1
      })

      const blob = result.blob

      if (blob) {
				const ai_result = await sendToBackend(blob)

        if(ai_result){
          const{box_2d, explanation} = ai_result
          const[ymin,xmin,ymax,xmax] = box_2d

          //starting position of drawing + percent across page 
          const x = selectionBounds.x + (xmin/1000) * selectionBounds.width
          const y = selectionBounds.y + (ymin/1000) * selectionBounds.height
          //percent the error covers times width of page
          const w = ((xmax - xmin)/1000) * selectionBounds.width
          const h = ((ymax -ymin)/1000) * selectionBounds.height

          const circleId = createShapeId()
          editor.createShape({
            id: circleId,
            type: 'geo',
            x: x,
            y:y,
            props:{
              geo: 'ellipse',
              w:w,
              h:h,
              colour: 'red',
              fill: 'none',
              dash: 'draw',
              size: 'm',
            },
          })

          editor.createShape({
            id: createShapeId(),
            type: 'text',
            x: x + w + 20,
            y: y,
            props: {
              text: '${explanation}',
              colour: 'red',
              size: 's',
            },
          })
        }
			}
    }catch(error){
      console.error("Snapshot failed:", error)
			alert("Error taking snapshot. Check console.")
    }finally{
      setIsLoading(false)
    }
  }

  return (
        <>
            <button
                onClick={handleSnapshot}
                disabled={isLoading}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 2000,
                    padding: '10px 20px',
                    background: isLoading ? 'grey' : 'blue',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                }}
            >
                {isLoading ? 'Thinking...' : 'Analyze Notebook'}
            </button>
        </>
    )
}

export default function Home() {

  const handlePing = async() => {
    try{
      const response = await fetch('http://localhost:8000/process-drawing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: "Hello Python!" }),
      });
    
      const data = await response.json();
      alert("Backend replied: " + data.reply);

    }catch (error){
      console.error(error);
      alert("Connection failed!");
    }
  }

  return(
    <div style={{ position: 'fixed', inset: 0 }}>
      {/*temporary button to test connection */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
            <button 
                onClick={handlePing}
                style={{ padding: '10px 20px', background: 'black', color: 'white', borderRadius: '8px' }}
            >
                Test Connection
            </button>
        </div>
      {/* Component for drawing canvas */}
      <Tldraw>
        {/* Put function inside tldraw so it can see pixels*/}
        <AnalyzeButton/>
      </Tldraw >
    </div>
  )
}
