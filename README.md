<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLI Music Player</title>
</head>
<body>

    <h1>🎵 CLI Music Player</h1>

    <p>
        A simple and interactive <strong>Command-Line Music Player</strong>
        built with <strong>Node.js</strong> and <strong>VLC</strong>.
        The project allows users to play and control their local music directly
        from the terminal.
    </p>

    <h2>✨ Features</h2>

    <ul>
        <li>▶️ Play / Pause songs</li>
        <li>⏭️ Play next song</li>
        <li>⏮️ Play previous song</li>
        <li>⬆️⬇️ Navigate through songs</li>
        <li>🔀 Shuffle mode</li>
        <li>🔁 Repeat mode</li>
        <li>⏩ Seek forward by 10 seconds</li>
        <li>⏪ Seek backward by 10 seconds</li>
        <li>📊 Live progress bar</li>
        <li>⏱️ Elapsed time and total duration</li>
        <li>📜 Playback history</li>
        <li>💾 Save history in <code>history.json</code></li>
        <li>🔄 Automatically play the next song when a song ends</li>
        <li>🖥️ Simple terminal-based user interface</li>
    </ul>

    <h2>🛠️ Tech Stack</h2>

    <ul>
        <li><strong>Node.js</strong></li>
        <li><strong>JavaScript</strong></li>
        <li><strong>VLC Media Player</strong></li>
        <li><strong>File System (fs)</strong></li>
        <li><strong>Child Process</strong></li>
    </ul>

    <h2>📂 Project Structure</h2>

    <pre>
MusicPlayer/
│
├── songs/
│   ├── song1.mp3
│   ├── song2.mp3
│   └── ...
│
├── history.json
├── index.js
└── README.md
    </pre>

    <h2>🚀 Getting Started</h2>

    <h3>Prerequisites</h3>

    <p>Make sure you have:</p>

    <ul>
        <li>Node.js installed</li>
        <li>VLC Media Player installed</li>
        <li>MP3 songs inside the <code>songs</code> folder</li>
    </ul>

    <h3>Run the Project</h3>

    <p>Clone the repository:</p>

    <pre><code>git clone &lt;your-repository-url&gt;</code></pre>

    <p>Go to the project folder:</p>

    <pre><code>cd MusicPlayer</code></pre>

    <p>Add your songs to the <code>songs</code> folder and run:</p>

    <pre><code>node index.js</code></pre>

    <h2>🎮 Controls</h2>

    <table border="1" cellpadding="8" cellspacing="0">
        <thead>
            <tr>
                <th>Key</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>Enter</code></td>
                <td>Play selected song</td>
            </tr>
            <tr>
                <td><code>p</code></td>
                <td>Play / Pause</td>
            </tr>
            <tr>
                <td><code>n</code></td>
                <td>Next song</td>
            </tr>
            <tr>
                <td><code>b</code></td>
                <td>Previous song</td>
            </tr>
            <tr>
                <td><code>↑ / ↓</code></td>
                <td>Navigate songs</td>
            </tr>
            <tr>
                <td><code>←</code></td>
                <td>Seek backward 10 seconds</td>
            </tr>
            <tr>
                <td><code>→</code></td>
                <td>Seek forward 10 seconds</td>
            </tr>
            <tr>
                <td><code>s</code></td>
                <td>Toggle Shuffle</td>
            </tr>
            <tr>
                <td><code>r</code></td>
                <td>Toggle Repeat</td>
            </tr>
            <tr>
                <td><code>Ctrl + C</code></td>
                <td>Exit</td>
            </tr>
        </tbody>
    </table>

    <h2>📊 Progress Bar</h2>

    <p>
        While a song is playing, the terminal displays its current progress
        along with the elapsed and total duration.
    </p>

    <p>Example:</p>

    <pre>
[====================--------------------]
Time: 42s / 120s
    </pre>

    <h2>📜 Playback History</h2>

    <p>
        The player keeps track of playback information using
        <code>history.json</code>.
    </p>

    <p>It stores details such as:</p>

    <ul>
        <li>Total songs played</li>
        <li>Total hours played</li>
        <li>Recently played songs</li>
    </ul>

    <h2>🔧 How It Works</h2>

    <p>
        The application uses Node.js <code>child_process</code> to start
        and communicate with VLC.
    </p>

    <p>
        VLC runs using its command interface, allowing the application
        to send commands for:
    </p>

    <ul>
        <li>Play / Pause</li>
        <li>Seeking</li>
        <li>Changing songs</li>
    </ul>

    <p>
        The application also reads the <code>songs</code> folder dynamically,
        so new MP3 files can be added without changing the code.
    </p>

    <h2>🎯 Learning Outcomes</h2>

    <p>This project helped in understanding:</p>

    <ul>
        <li>Node.js and JavaScript</li>
        <li>Event-driven programming</li>
        <li>Keyboard input handling</li>
        <li>File system operations</li>
        <li>JSON file handling</li>
        <li>Child processes</li>
        <li>Process management</li>
        <li>Timers and state management</li>
        <li>Working with external applications</li>
    </ul>

    <h2>👨‍💻 Author</h2>

    <p>
        <strong>Parag Garg</strong>
    </p>

    <p>
        B.Tech — Computer Science &amp; Artificial Intelligence
    </p>

</body>
</html>