import giraffeImage from '../assets/image/giraffe_base_fill.png';
import "../assets/unified-style.css";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Progress({ tasks, complete_num }){
    const { t } = useTranslation();
    const percentage = tasks.length > 0 ? Math.min(100, (complete_num / tasks.length) * 100) : 0;
    const giraffeWidth = (complete_num / tasks.length) * 57 + "%";
    return (
        <div className="progress">
            <div className="weekly-progress">
                <h2>{t("progress.title")}</h2>
                <p>{t("progress.all")}{tasks.length}</p>
                <p>{t("progress.completed")}{complete_num}</p>
                <p>{t("progress.percentage")}{percentage}%</p>
                <h4 className="good-sentence">
                    {t("progress.sentence")}
                </h4>
                <h4>{t("progress.sentence2")}</h4>
                <Link to="/plan"><button>{t("progress.viewplan")}</button></Link>
            </div>

            <div className="giraffe-progress">
                <img src={giraffeImage} className="giraffe-base" />
                <div className="giraffe-fill-wrapper">
                    <div className="giraffe-fill" style={{width:giraffeWidth}}></div>
                </div>
            </div>
      </div>
    )
    
}
export default Progress;