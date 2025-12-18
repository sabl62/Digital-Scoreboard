import { useState, useEffect } from 'react';
import { getHello, testPost } from '../services/api';

function BackendTest() {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [postResult, setPostResult] = useState(null);

    useEffect(() => {
        // Test GET request
        getHello()
            .then(data => {
                setMessage(data.message);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setLoading(false);
            });
    }, []);

    const handleTestPost = async () => {
        try {
            const result = await testPost({ test: 'Hello Backend!' });
            setPostResult(result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Backend Connection Test</h2>
            <p>Message from Django: <strong>{message}</strong></p>

            <button onClick={handleTestPost}>
                Test POST Request
            </button>

            {postResult && (
                <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
                    <h3>POST Response:</h3>
                    <pre>{JSON.stringify(postResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default BackendTest;