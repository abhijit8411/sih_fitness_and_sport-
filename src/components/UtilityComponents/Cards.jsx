import { Link, useNavigate } from 'react-router-dom';

require('./Utility.css')

const Cards = ({ data }) => {
  const navigate = useNavigate();
  return (
    <div className="flex overflow-x-auto w-full gap-6 pb-4 pt-2 snap-x hide-scrollbar">
      {data.map((item, index) => (
         <Link 
            key={index}
            to={item.link || '#'}
            className="flex-shrink-0 w-[300px] group snap-start"
         >
          <div className="flex flex-col gap-3">
            <div
              className="w-full h-[200px] rounded-2xl bg-gray-900 overflow-hidden relative shadow-lg group-hover:shadow-2xl transition-all"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-white font-semibold text-lg px-1">{item.label}</span>
          </div>
         </Link>
      ))}
    </div>
  );
};

export default Cards;
