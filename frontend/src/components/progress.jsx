import giraffeImage from '../assets/image/giraffe_base_fill.png';
import "../assets/unified-style.css";
import { Link } from 'react-router-dom';

function Progress({ tasks, complete_num }){
    const percentage = tasks.length > 0 ? Math.min(100, (complete_num / tasks.length) * 100) : 0;
    const giraffeWidth = (complete_num / tasks.length) * 57 + "%";
    return (
        <div className="progress">
            <div className="weekly-progress">
                <h2>📈 学习进度</h2>
                <p>全部任务数:{tasks.length}</p>
                <p>已完成任务数:{complete_num}</p>
                <p>完成度:{percentage}%</p>
                <h4 className="good-sentence">
                    "每一次努力都是在为未来的自己铺路。"
                </h4>
                <h4>加油填满长颈鹿进度条吧~</h4>
                <Link to="/plan"><button>查看计划</button></Link>
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