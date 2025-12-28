'use client'

import { Tldraw, useEditor} from 'tldraw'
import 'tldraw/tldraw.css'
import { useState } from 'react'

//Child component of tldraw which gets coordinates of drawing
function AnalyzeButton(){
  const editor = useEditor()
  const [isLoading, setIsLoading] = useState(false)

  const handleSnapshot = async() => {
    setIsLoading(true)
    try{

      const shapeIds = editor.getCurrentPageShapeIds()
			if (shapeIds.size === 0) {
				alert('Draw something first!')
				setIsLoading(false)
				return
			}

      const result = await editor.toImage([...shapeIds], {
        format: 'png',
        background: false,
        scale: 1
      })

      const blob = result.blob

      if (blob) {
				console.log("Success! Blob created:", blob)
				alert(`Snapshot successful! (${blob.size} bytes)`)
			}

    }catch(error){
      console.error("Snapshot failed:", error)
			alert("Error taking snapshot. Check console.")
    }finally{
      setIsLoading(false)
    }
  }

  return (
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
			{isLoading ? 'Processing...' : 'Analyze Notebook'}
		</button>
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
