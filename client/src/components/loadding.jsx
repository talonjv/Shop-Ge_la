
import "tailwindcss/tailwind.css";
const loaDDing = () => {
  return (
    <div>
      return (
    <div className="relative w-20 h-16 ml-20">
      <div className="absolute w-[180%] h-[75%] top-[70%] right-[20%] bg-black rounded-[40px_10px] blur-[10px] opacity-30"></div>
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className={`absolute w-[80%] h-[35px] bg-yellow-400 bottom-[32%] right-[64%] origin-right scale-${(index + 1) * 2} 
          animate-[tap-upper-${index + 1}_1.2s_ease-in-out_infinite]`}
        >
          <div className="absolute w-[140%] h-[30px] bg-yellow-400 bottom-[8%] right-[65%] origin-right rotate-[-60deg] rounded-[20px]"></div>
        </div>
      ))}
      <div className="block w-full h-full absolute top-0 left-0 bg-yellow-400 rounded-[10px_40px]"></div>
      <div className="absolute w-[120%] h-[38px] bg-yellow-400 bottom-[-18%] right-[1%] origin-[calc(100%-20px)_20px] rotate-[-20deg] 
      rounded-[30px_20px_20px_10px] border-b-2 border-l-2 border-black/10">
        <div className="absolute w-[20%] h-[60%] bg-white/30 bottom-[-8%] left-[5px] rounded-[60%_10%_10%_30%] border-r-2 border-black/10"></div>
      </div>
      <style>
        {`
          @keyframes tap-upper-1 {
            0%, 50%, 100% { transform: rotate(10deg) scale(0.4); }
            40% { transform: rotate(50deg) scale(0.4); }
          }
          @keyframes tap-upper-2 {
            0%, 50%, 100% { transform: rotate(10deg) scale(0.6); }
            40% { transform: rotate(50deg) scale(0.6); }
          }
          @keyframes tap-upper-3 {
            0%, 50%, 100% { transform: rotate(10deg) scale(0.8); }
            40% { transform: rotate(50deg) scale(0.8); }
          }
          @keyframes tap-upper-4 {
            0%, 50%, 100% { transform: rotate(10deg) scale(1); }
            40% { transform: rotate(50deg) scale(1); }
          }
        `}
      </style>
    </div>
  );

    </div>
  )
}

export default loaDDing
