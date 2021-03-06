import * as React from 'react';
import * as tfjs from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';


export function useFaceMeshFmPredictions(videoRef) {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [fmModel, setFmModel] = React.useState(null);
    const [fmPrediction, setFmPrediction] = React.useState(null);
    const loadFmModel = async () => {
        try {
            await tfjs.setBackend('webgl');
            // await tfjs.setBackend('wasm');
            const loadedFmModel = await facemesh.load({ maxFaces: 1 });

            setLoading(false);
            setFmModel(loadedFmModel);
        }
        catch (error) {
            console.error(error);
            setLoading(false);
            setError(error);
        }
    };
    React.useEffect(() => {

        if (!fmModel && !!videoRef.current && loading) {
            loadFmModel();
        }
    }, [videoRef, fmModel, loading]);

    const getFmPrediction = () => {
        const _estimateFaceMesh = async () => {
            const fmPredictions = await fmModel.estimateFaces(videoRef.current);
            const ctx = videoRef.current.getContext('2d');
            if (fmPredictions.length > 0) {
                fmPredictions.forEach(fmPrediction => {
                    const keypoints = fmPrediction.scaledMesh;

                    for (let i = 0; i < keypoints.length; i++) {
                        const x = keypoints[i][0];
                        const y = keypoints[i][1];

                        ctx.beginPath();
                        ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
                        ctx.fill();
                    }

                });
                setFmPrediction(fmPredictions);
            }
            else {
                setFmPrediction('unknown');
            }
        };
        if (!fmModel && !!videoRef.current && loading) {
            loadFmModel();
        }

        if (!!fmModel && !!videoRef.current) {
            _estimateFaceMesh();
        }
    };

    return {
        getFmPrediction,
        resetFmPrediction: () => { setFmPrediction(null); },
        fmPrediction,
        loading,
        error,
    };
}