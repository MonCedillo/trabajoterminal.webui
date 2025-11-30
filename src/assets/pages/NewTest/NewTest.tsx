import React from 'react';
import styles from './NewTest.module.scss';

import InfoCard from '../../common/InfoCard/main';
import Counter from '../../common/Counter/main';
import DownloadButton from '../../common/DownloadButton/DownloadButton';
import ControlPanel from '../../common/ControlPanel/ControlPanel';
import Graph from '../../common/Graph/main';


interface NewTestProps {
  currentCount: number; 
}

const NewTest: React.FC<NewTestProps> = ({ currentCount }) => {

  return (
    <div className={styles.newTestContainer}>
      <div className={styles.graphicsArea}>
        <Graph />
      </div>

      <div className={styles.counterArea}>
        <h2>Contador de ciclos</h2>
        <Counter count={currentCount} /> 
      </div>

      <div className={styles.infoArea}>
        <InfoCard />
      </div>

      <div className={styles.controlArea}>
        <ControlPanel />
      </div>

      <div className={styles.downloadButtonArea}>
        <DownloadButton />
      </div>
    </div>
  );
};

export default NewTest;