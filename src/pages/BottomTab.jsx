import { useState } from 'react'
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';

import './BottomTab.css';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className={value !== index?'display-none':'display-flex'}
    >
      {value === index && <Box  sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function RightTab({doc, dot, splitRef}) {
    const [value, setValue] = useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    // style={{position:'absolute', top:4, right:0}}
    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="DOC" {...a11yProps(0)} />
              <Tab label="DOT" {...a11yProps(1)} />
              <div >
                  <IconButton color="primary" aria-label="minimize" onClick={()=>splitRef.current.resize([0, 0])} >
                       <RemoveIcon />
                    </IconButton>
              </div>
            </Tabs>

          </Box>
          <CustomTabPanel value={value} index={0} style={{flex: 1, flexDirection: 'column', overflow: 'auto'}}>

            <pre>
            {doc}
            </pre>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1} style={{flex: 1, flexDirection: 'column', overflow: 'auto'}}>
            <pre>{dot}</pre>


          </CustomTabPanel>
        </Box>
    );
}


export default RightTab;