import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';


export default function Graphites() {
  const navigate = useNavigate(); // Get the navigate function


  const [apps, setApps] = useState([]); // State to hold the apps
  useEffect(() => {

    (async () => { // IIFE
      try {
        const response = await fetch("/apps.json");
        const apps = await response.json();
        setApps(apps);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    })();

  }, []);
  //render only once


  return (
    <Box sx={{ flexGrow: 1, p: 0 }} style={{ margin: '0px' }}>
      <Grid
        container
        spacing={1}
        sx={{
          '--Grid-borderWidth': '1px',
          borderTop: 'var(--Grid-borderWidth) solid',
          borderLeft: 'var(--Grid-borderWidth) solid',
          borderColor: 'divider',
          '& > div': {
            borderRight: 'var(--Grid-borderWidth) solid',
            borderBottom: 'var(--Grid-borderWidth) solid',
            borderColor: 'divider',
          },
        }}
      >
        {apps.map((g, index) => (
          <Grid
            key={index}
            minHeight={160}
            size={{
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
            }}
          >

            <Card sx={{}} onClick={() => navigate(g.link)}>
              <CardMedia
                component="img"
                alt="green iguana"
                height="140"
                image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {g.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  sx
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Share</Button>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>

          </Grid>
        ))}
      </Grid>
    </Box>

  );
}