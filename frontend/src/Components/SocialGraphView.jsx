import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { mockEmails } from "../mockdata"; //  

const SocialGraphView = () => {
  // Transform your email data into Nodes and Links for the graph
const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const uniqueUsers = new Set();

    mockEmails.forEach(email => {
      // Add Sender Node
    if (!uniqueUsers.has(email.senderEmail)) {
        nodes.push({ 

            id: email.senderEmail, 
            name: email.senderName, 
            val: 10, 
            color: email.riskLevel === 'high' ? '#f43f5e' : '#10b981' 
        });
        uniqueUsers.add(email.senderEmail);

        }

      // Add "Mock" link to illustrate communication
      // In your actual thesis, you would import the 'comm_graph' JSON here
        links.push({ 
        source: email.senderEmail, 
        target: "company.central@enron.com", 
        value: 2,
        color: email.riskLevel === 'high' ? '#f43f5e' : '#cbd5e1'
        });
    });

    return { nodes, links };
    }, []);

    return (
    <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800">
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-3 rounded-lg border border-slate-700 backdrop-blur-sm">
        <h3 className="text-white font-bold text-sm">Identity Interaction Map</h3>
        <p className="text-slate-400 text-xs">Visualizing 23 community subnets & communication anomalies</p>
        </div>

    <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor={node => node.color}
        linkColor={link => link.color}
        linkWidth={link => link.value}
        backgroundColor="#020617"
        nodeRelSize={6}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
    />
    </div>

    );
};

export default SocialGraphView;