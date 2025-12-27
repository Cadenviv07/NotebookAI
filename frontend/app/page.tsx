'use client'

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

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
      <Tldraw />
    </div>
  )
}
