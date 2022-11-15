import logo from './logo.svg';
import './App.css';
import ForceGraph2D from 'react-force-graph-2d';
import React, { useRef } from 'react';

function App() {

    const [t, tt] = React.useState(true);
    const [total, setTotal] = React.useState(10); // FIXME

    const g = useRef();

    const genRandomTree = (N = 300, reverse = false) => {
        return {
            nodes: [...Array(N).keys()].map(i => ({ id: i })),
            links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                [reverse ? 'target' : 'source']: id,
                [reverse ? 'source' : 'target']: Math.round(Math.random() * (id-1))
            }))
        };
    }

    const generateNodes = (N = 30) => {

        let links = []

        return {
            nodes: [...Array(N).keys()].map(i => {

                const colormap = ["red", "blue", "green"];

                const strat = Math.floor(Math.random() * 3)

                return {
                    id: i,
                    color: colormap[strat],
                    strat: strat,
                    opponent_prev_play: 0,
                    //val: Math.random() * 10,
                    ah: Math.random() * 5,
                }
            }),
            links: [...Array(N).keys()].map(i => {
                return [...Array(N).keys()].filter(j => i < j).map(j => ({
                            ['source']: i,
                            ['target']: j,
                            ['color']: "lightgrey",
                            ['dd']: Math.random(),
                }))
            }).flat(2)
            //links: [...Array((N*(N-1))/2).keys()]
            //    //.filter(id => id)
            //    .map(id => ({
            //        ['source']: id
            //        ['target']:
            //        ['distance']:
            //    })
            //[...Array(N).keys()]
            //.filter(id => id)
            //.map(id => ({
            //    ['source']: id,
            //    ['target']: Math.round(Math.random() * (id-1)), // FIXME
            //    //['distance']: 1000
            //}))
        };
    }

    const [data, setData] = React.useState(genRandomTree(0))
    const [firstClick, setFirstClick] = React.useState(true)

    const calcProb = (sourceval, targetval) => {
        let x = sourceval
        let y = targetval
        //console.log(sourceval,targetval)
        //return 1/(1+Math.exp(-1*(sourceval-targetval)))
        //return sourceval + targetval
        //return Math.random()
        //let v = Math.abs((sourceval - targetval)) / (sourceval + targetval)
        //let v = Math.abs(sourceval-targetval)
        //let v = sourceval / targetval
        //console.log(v, "vv", sourceval, targetval)
        //return v
        //return Math.random()
        //return (Math.exp(sourceval-targetval)))
        //return Math.pow(Math.sin(sourceval), 2) + Math.pow(Math.sin(targetval), 2)


        //let v = getBaseLog(sourceval, Math.sin(targetval))
        //let v =
        let v = Math.abs(Math.tan(x/y))

        //console.log(v, sourceval, targetval)

        //let v = Math.abs(Math.log(sourceval) - Math.log(targetval))

        return v

    }

    const getBaseLog = (x, y) => {
        return Math.log(y) / Math.log(x);
    }

    const playGames = () => {
        console.log("play games")
        const payoff = [[[3,3],[0,5]],[[5,0],[1,1]]]
        //data.nodes.forEach((node) => {
        //})
        //setData()


        let takenIDs = []
        data.nodes.forEach((node) => {
            if (takenIDs.includes(node.id)) return;
            let maxDD = 0
            let strongestLink = null

            data.links.forEach((link) => {

                if (link.source.id == node.id) {
                    if (takenIDs.includes(link.target.id)) return;
                    //console.log("this is running!", node.id)
                    if (maxDD < link.dd) {
                        maxDD = link.dd
                        strongestLink = link
                    }
                }
                if (link.target.id == node.id) {
                    if (takenIDs.includes(link.source.id)) return;
                    //console.log("this is running!", node.id)
                    if (maxDD < link.dd) {
                        maxDD = link.dd
                        strongestLink = link
                    }
                }

                //if (link.source.id == node.id || link.target.id == node.id) {
                //    if (takenIDs.includes(link.source.id) || takenIDs.includes(link.target.id)) return ;
                //    console.log("this is running!", node.id)
                //    if (maxDD < link.dd) {
                //        maxDD = link.dd
                //        strongestLink = link
                //    }
                //}
            })

            //console.log(takenIDs)

            takenIDs.push(strongestLink.target.id)
            takenIDs.push(strongestLink.source.id)


            const opponent = data.nodes.filter(n => n.id == strongestLink.source.id || n.id == strongestLink.target.id).filter(l => l.id != node.id)[0]
            //console.log(node.id, opponent.id)

            //console.log(node, opponent)

            let iplay = node.strat
            if (node.strat == 2) {
                iplay = node.opponent_prev_play
            }

            let jplay = opponent.strat
            if (opponent.strat == 2) {
                jplay = opponent.opponent_prev_play

            }

            node.opponent_prev_play = jplay
            opponent.opponent_prev_play = iplay

            node.ah += payoff[iplay][jplay][0]
            opponent.ah += payoff[iplay][jplay][1]


            node.ah = (node.ah / total)
            opponent.ah = (opponent.ah / total)

            //node.val = node.ah * 100
            //opponent.val = opponent.ah * 100


            setTotal(total+payoff[iplay][jplay][0]+payoff[iplay][jplay][1])
        })
        setData(data)
        //console.log(data)
    }

    const rainbow = (n) => {
        return `rgba(149, 149, 149, ${n})`;

    }

    const transformRange = (value, r1, r2) => {
        let scale = (r2.max - r2.min) / (r1.max - r1.min)
        return (value - r1.min) * scale;
    }

    const handleClick = () => {
        g.current.d3ReheatSimulation()

        if (firstClick) {
            g.current.d3Force('link')
                .strength(link => {
                    return link.dd / 100
                })
            setFirstClick(false)
            return
        }

    g.current.d3Force('link')
        .strength(link => {
            let v = (
                (1-calcProb(link.source.ah, link.target.ah))
            ) / 100
            //console.log(v)


            link.dd = v
            const cutoff = 0.3
            if (v*100 < cutoff) { v = 0 }

            link.color = rainbow(transformRange(v*100, {max: 1, min: cutoff}, {max: 1, min: 0}))
            console.log(v*100)
            return v
            })

        playGames()
        g.current.d3ReheatSimulation()

    }

    React.useEffect(() => {
        const d = generateNodes(200) // MARK
        //console.log(d)
        setData(d);
    }, [])



    return (
        <div className="" onClick={handleClick}>
            <ForceGraph2D graphData={data} ref={g}
                //onRenderFramePre={e => {
                    //if (t && fgRef.current) {
                    //    console.log(e);
                    //    tt(false);
                    //    fgRef.current.d3Force('link').distance(5);
                    //    console.log(fgRef.current.d3Force('link').distance());
                    //}
                //}}
            />
        </div>
    );
}

export default App;
