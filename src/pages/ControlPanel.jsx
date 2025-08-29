
import IconButton from '@mui/material/IconButton';

import DownloadIcon from '@mui/icons-material/Download';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import HomeIcon from '@mui/icons-material/Home';
import Stack from '@mui/material/Stack';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';


function RightGraph({downloadGraph,
    prevGraph, nextGraph, resetGraph, firstGraph, lastGraph,
    fullScreen, fullScreenState
}) {

    return (
        // <div style={{border:'2px solid red',height:'100%', width:'100%'}}>
            // <div className={"graphCanvas"} ></div>
            <Stack id="graphDownload"
                direction="row"
                style={{
                padding: '15px',
                position:'absolute',
                left:0,
                top:0,
                border: '0px solid red',
                display:'flex',
                displayDirection:'column',
                backgroundColor: "rgba(200,200,200, 0)"
                }}>
                {/*
                 <IconButton color="primary" aria-label="add to shopping cart" onClick={fullScreen} >
                    {fullScreenState ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
*/}
                <IconButton onClick={resetGraph}><HomeIcon/></IconButton>
                <IconButton onClick={prevGraph} disabled={firstGraph}><UndoIcon/></IconButton>
                <IconButton onClick={nextGraph} disabled={lastGraph}><RedoIcon/></IconButton>
                <IconButton onClick={downloadGraph}><DownloadIcon/></IconButton>

            </Stack>
        // </div>
    );
}

export default RightGraph;

