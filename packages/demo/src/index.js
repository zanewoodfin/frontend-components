import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { treeTable, TreeRowWrapper, sizeCalculator, collapseBuilder } from '../../components/src/Components/TreeTable';
// import { ReactCharts} from '@patternfly/patternfly';
import { ChartPie } from '@patternfly/react-charts/dist/js/components/ChartPie';
// import{ChartPie} from '@patternfly/react-charts';
import {Chart} from '../../pdf-generator/src/components/Chart';
import {Battery} from '../../pdf-generator/src/components/Battery';
import {Section} from '../../pdf-generator/src/components/Section';
import {Column} from '../../pdf-generator/src/components/Column';
import {Panel} from '../../pdf-generator/src/components/Panel';
import {PanelItem} from '../../pdf-generator/src/components/PanelItem';
// import Section from '../../pdf-generator/src/components/Section'
import './index.scss';
import {
    Table,
    TableHeader,
    TableBody,
    textCenter
} from '@patternfly/react-table';



const testMessage = {
    id: 'test',
    description:'Testing',
    defaultMessage:'ChartTesting'
}

class MyCmp extends Component {

    collapseRows = (...props) => {
        const { rows } = this.state;
        this.setState({
            rows: collapseBuilder()(rows, ...props)
        });
    }

    render() {

        console.log('We can still present a data table: ', testMessage);
        return (
            <div style={{height: '275px', width: '350px'}}>
                <h1>This is my render</h1>
                    <ChartPie
                        ariaDesc="Testing of labels on a Victory Pie Chart for the frontend advisor application"
                        ariaTitle="Pie chart example"
                        constrainToVisibleArea={true}
                        data={[
                            {x: testMessage.defaultMessage, y: 20},
                            {x: testMessage.defaultMessage, y: 20},
                            {x: testMessage.defaultMessage, y: 20},
                            {x: testMessage.defaultMessage, y: 40}
                        ]}
                        labels={({datum})=> `${datum.x} : ${datum.y}`}
                        legendData={[{ name: 'Cats: 35' }, { name: 'Dogs: 55' }, { name: 'Birds: 10' }]}
                        legendPosition="bottom"
                        padding={{
                            bottom: 65,
                            left: 20,
                            right: 20,
                            top: 20
                        }}
                        height={275}
                        width={350}
                />
            </div>
        );
    }
}

ReactDOM.render(<MyCmp />, document.querySelector('.demo-app'));
