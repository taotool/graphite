import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { apps } from "./apps.js";

export default function Graphites() {
    const navigate = useNavigate(); // Get the navigate function
    const theme = useTheme();

// const gg = [
//         { title: 'Sample', segment:"graphite", link: '/graphite/sample', img: './'+theme.palette.mode+'/combos.png'},
//         { title: 'Site', segment:"graphite", link: '/graphite/site', img: 'https://mui.com/static/images/cards/contemplative-reptile.jpg' },
//         { title: '济公传', segment:"graphite", link: '/graphite/jigongzhuan', img: 'https://mui.com/static/images/cards/contemplative-reptile.jpg' },
//       ];

  return (
<Box sx={{ flexGrow: 1, p: 0 }} style={{margin:'0px'}}>
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

                <Card sx={{ }} onClick={()=>navigate(g.link)}>
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