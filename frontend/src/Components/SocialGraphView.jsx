import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { mockEmails } from '../mockdata'; // Ensure this path is correct!

const SocialGraphView = () => {
    const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const uniqueUsers = new Set();

    // 1. Create Nodes from your 5 Mock Emails
    mockEmails.forEach(email => {
        if (!uniqueUsers.has(email.senderEmail)) {
        nodes.push({ 
            id: email.senderEmail, 
            name: email.senderName, 
            color: email.riskLevel === 'high' ? '#f43f5e' : '#10b981',
          val: email.riskLevel === 'high' ? 15 : 8 // High risk nodes are bigger
        });
        uniqueUsers.add(email.senderEmail);
        }
        
      // 2. Create connections to simulate the "Social Graph"
      // We connect them to a central hub to force them to spread out
        links.push({ 
        source: email.senderEmail, 
        target: "Internal-Server-Node", 
        color: email.riskLevel === 'high' ? '#f43f5e' : '#475569'
        });
    });

    // Add a central anchor node to stabilize the visualization
    nodes.push({ id: "Internal-Server-Node", name: "Corporate Hub", color: "#6366f1", val: 5 });

    return { nodes, links };
    }, []);

    return (
    <div className="w-full h-[600px] bg-slate-950 rounded-xl relative">
        <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalParticles={2} // Adds moving dots to show "flow"
        linkDirectionalParticleSpeed={0.005}
        backgroundColor="#020617"
        nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.beginPath(); 
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false); 
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillText(label, node.x, node.y + node.val + 5);
        }}
        />
    </div>
    );
};

export default SocialGraphView;