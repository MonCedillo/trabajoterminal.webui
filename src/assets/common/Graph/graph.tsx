import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface MotionData {
    timestamp: number;
    x: number;
    y: number;
    z: number;
}

const RobotMotionGraph: React.FC = () => {
    const [motionData, setMotionData] = useState<MotionData[]>([]);

    useEffect(() => {
        // Example WebSocket connection - replace with your actual endpoint
        const ws = new WebSocket('ws://your-raspberry-pi-ip:port');

        ws.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            setMotionData((prevData) => {
                // Keep last 50 data points for smooth visualization
                const updatedData = [...prevData, newData];
                return updatedData.slice(-50);
            });
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <h2>Robot Motion Graph</h2>
            <LineChart
                width={800}
                height={400}
                data={motionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="x"
                    stroke="#8884d8"
                    name="X-Axis"
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="y"
                    stroke="#82ca9d"
                    name="Y-Axis"
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="z"
                    stroke="#ffc658"
                    name="Z-Axis"
                    dot={false}
                />
            </LineChart>
        </div>
    );
};

export default RobotMotionGraph;