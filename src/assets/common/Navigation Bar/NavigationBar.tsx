import React from "react";
import styles from "./NavigationBar.scss";

const css = styles as any;

const NavigationBar: React.FC = () => {
    return (
        <header className={css.NavigationBar}>
            <div className={css.Title}>
                Certificación Laboratorio e Importaciones S.C. 
            </div>
        </header>
    );
};

export default NavigationBar;