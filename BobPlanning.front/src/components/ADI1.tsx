import { Card, CardContent, Typography } from '@mui/material';
import NbGroupesPromo from './NbGroupesPromo';

export default function ADI1(){
    return (
        <Card>
            <h1>ADI1</h1>
            <CardContent>
                <Typography variant="h5" component="div">
                    Groupes Promo
                </Typography>
                <NbGroupesPromo />
            </CardContent>
        </Card>
    );
};