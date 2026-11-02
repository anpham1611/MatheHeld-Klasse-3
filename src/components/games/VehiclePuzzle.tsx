import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX } from 'lucide-react';
import { PlayerProfile } from '../../types/game';
import { sound } from '../../audio/soundManager';
import {
  generateVehiclePuzzle,
  MAX_VEHICLES_PER_ROUND,
  MIN_VEHICLES_PER_ROUND,
  VehicleDesign,
  VehiclePart,
  VehicleType,
} from '../../math/vehiclePuzzle';

interface VehiclePuzzleProps {
  player: PlayerProfile;
  onUpdateStats: (stars: number, coins: number, score: number) => void;
  onBack: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

function VehicleArtwork({ vehicle }: { vehicle: VehicleDesign }) {
  const outline = '#263044';

  return (
    <svg viewBox="0 0 220 130" className="h-full w-full" aria-hidden="true">
      {vehicle.type === 'car' && <>
        <circle cx="63" cy="99" r="22" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="63" cy="99" r="10" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="165" cy="99" r="22" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="165" cy="99" r="10" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d={vehicle.variant % 5 === 0
          ? 'M22 91 L32 63 Q36 52 60 49 L82 26 Q88 20 110 22 L139 50 L176 56 Q190 60 196 80 L199 94 L190 103 L31 103Z'
          : 'M22 91 L31 67 Q36 53 60 51 L78 32 Q86 24 110 24 L141 49 L177 57 Q191 63 197 82 L199 94 L189 103 L31 103Z'}
          fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M70 49 L88 30 L107 30 L107 49Z M116 30 L135 50 L116 49Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M111 53 L111 91 M146 63 L146 86" fill="none" stroke={outline} strokeWidth="3" />
        <path d="M23 76 L37 74 L32 87 L22 87Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="3" />
        <path d="M190 74 L198 78 L199 87 L190 87Z" fill="#ffe37a" stroke={outline} strokeWidth="3" />
        <circle cx="126" cy="60" r="3" fill={outline} />
      </>}

      {vehicle.type === 'tractor' && <>
        <circle cx="159" cy="96" r="29" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="159" cy="96" r="13" fill="#aeb5ba" stroke={outline} strokeWidth="4" />
        <circle cx="55" cy="101" r="17" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="55" cy="101" r="7" fill="#aeb5ba" stroke={outline} strokeWidth="3" />
        <path d="M36 67 L97 67 L108 84 L117 91 L115 105 L77 105 L70 88 L34 88Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M97 34 L146 34 L155 69 L116 75 L104 61Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M106 42 L137 42 L143 63 L116 66Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M35 72 L28 72 L28 82 L37 82 M85 66 L85 51 L91 51" fill="none" stroke={vehicle.accentColor} strokeWidth="7" strokeLinecap="round" />
        <path d="M44 76 L84 76 M48 83 L78 83" stroke={outline} strokeWidth="3" />
      </>}

      {vehicle.type === 'train' && <>
        <circle cx="67" cy="101" r="16" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="67" cy="101" r="6" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="119" cy="101" r="19" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="119" cy="101" r="8" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="168" cy="101" r="19" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="168" cy="101" r="8" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d="M26 73 Q29 49 55 49 L123 49 L123 87 L29 87Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M123 42 L179 42 Q190 42 190 54 L190 88 L123 88Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M137 51 L153 51 L153 69 L137 69Z M160 51 L177 51 L177 69 L160 69Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M45 47 L50 25 L69 25 L76 50Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="4" />
        <path d="M22 90 L194 90" stroke={outline} strokeWidth="4" />
        <path d="M29 77 L38 67 L38 88 L28 88Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="3" />
      </>}

      {vehicle.type === 'helicopter' && <>
        <path d="M51 31 L109 26 L174 12 L179 17 L123 43 L68 48Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M94 41 L105 30 L110 15 M42 16 L174 16" fill="none" stroke={outline} strokeWidth="5" strokeLinecap="round" />
        <path d="M42 67 Q42 47 70 44 L127 44 Q143 45 150 61 L148 83 Q144 95 128 96 L66 94 Q44 90 42 67Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M81 48 L109 48 L109 71 L70 71 Q71 56 81 48Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M30 98 L155 98 M52 94 L47 105 M139 94 L145 105" fill="none" stroke={outline} strokeWidth="4" strokeLinecap="round" />
        <path d="M28 52 L18 43 L18 66 L31 61Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="3" />
      </>}

      {vehicle.type === 'bus' && <>
        <circle cx="55" cy="101" r="17" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="55" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="165" cy="101" r="17" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="165" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d="M25 42 Q25 31 39 31 L177 31 Q193 31 193 48 L193 98 L27 98Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        {[43, 73, 103, 133].map((x) => <rect key={x} x={x} y={39} width="23" height={vehicle.variant % 5 === 3 ? 19 : 29} rx="3" fill="#9fcee0" stroke={outline} strokeWidth="3" />)}
        {vehicle.variant % 5 === 3 && [43, 73, 103, 133].map((x) => <rect key={`upper-${x}`} x={x} y="64" width="23" height="16" rx="3" fill="#9fcee0" stroke={outline} strokeWidth="3" />)}
        <path d="M164 39 L186 39 L186 80 L164 80Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M29 84 L191 84" stroke={vehicle.accentColor} strokeWidth="7" />
      </>}

      {vehicle.type === 'truck' && <>
        <circle cx="62" cy="101" r="18" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="62" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="164" cy="101" r="18" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="164" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d={vehicle.variant % 5 === 2 ? 'M27 33 L133 33 L126 85 L27 85Z' : 'M27 33 L130 33 L130 85 L27 85Z'} fill={vehicle.accentColor} stroke={outline} strokeWidth="4" />
        <path d="M130 58 L163 58 L187 76 L190 98 L126 98Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M143 63 L160 63 L178 77 L143 77Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M34 42 L120 42 M34 51 L120 51" stroke={vehicle.bodyColor} strokeWidth="4" opacity=".8" />
      </>}

      {vehicle.type === 'fire_engine' && <>
        <circle cx="56" cy="101" r="17" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="56" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="162" cy="101" r="17" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="162" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d="M25 69 L121 69 L121 96 L27 96Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M121 61 L161 61 L186 77 L188 97 L121 97Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M134 66 L156 66 L173 78 L134 78Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M39 59 L147 35 L153 42 L44 67Z M49 53 L59 65 M74 47 L84 59 M99 41 L109 54 M123 37 L132 48" fill="none" stroke={vehicle.accentColor} strokeWidth="5" strokeLinecap="round" />
        <circle cx="151" cy="56" r="5" fill="#75c8ed" stroke={outline} strokeWidth="2" />
      </>}

      {vehicle.type === 'ambulance' && <>
        <circle cx="59" cy="101" r="18" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="59" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="161" cy="101" r="18" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="161" cy="101" r="7" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d="M28 48 Q28 37 41 37 L143 37 L180 58 L188 94 L30 94Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M146 43 L160 43 L179 58 L146 58Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M31 76 L187 76" stroke="#fffdf5" strokeWidth="10" />
        <path d="M92 52 L110 52 L110 61 L120 61 L120 74 L110 74 L110 85 L92 85 L92 74 L81 74 L81 61 L92 61Z" fill="#e45b55" />
        <path d="M97 31 L120 31" stroke={vehicle.accentColor} strokeWidth="8" strokeLinecap="round" />
      </>}

      {vehicle.type === 'airplane' && <>
        <path d="M14 71 L86 61 L103 25 L118 25 L115 61 L192 67 Q202 69 202 77 Q202 84 192 85 L115 86 L120 111 L105 111 L86 88 L17 83Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M44 69 L58 69 L49 79 L32 78Z M166 70 L179 70 L188 76 L166 78Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M98 65 L105 29 M99 85 L106 108" stroke={vehicle.accentColor} strokeWidth="7" />
        {vehicle.variant % 5 === 0 && <path d="M24 64 L14 52 M24 84 L14 96" stroke={outline} strokeWidth="4" strokeLinecap="round" />}
      </>}

      {vehicle.type === 'boat' && <>
        <path d="M25 84 L194 84 L174 111 Q113 126 51 111Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M104 83 L104 23 L153 75Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M96 84 L96 37 L62 75Z" fill="#f7edcf" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        {vehicle.variant % 5 === 4 && <path d="M45 87 L65 61 L87 61 L103 87Z" fill={vehicle.accentColor} stroke={outline} strokeWidth="4" />}
        <path d="M28 119 Q48 113 68 119 Q88 125 108 119 Q128 113 148 119 Q168 125 188 119" fill="none" stroke="#69b8d2" strokeWidth="5" strokeLinecap="round" />
      </>}

      {vehicle.type === 'bicycle' && <>
        <circle cx="53" cy="89" r="31" fill="none" stroke={outline} strokeWidth="5" />
        <circle cx="169" cy="89" r="31" fill="none" stroke={outline} strokeWidth="5" />
        <path d="M53 89 L91 48 L125 89 L53 89 L77 89 L106 48 L145 48 L169 89 M145 48 L156 39 M91 48 L80 38" fill="none" stroke={vehicle.bodyColor} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M70 35 L93 35 M137 35 L160 35" stroke={vehicle.accentColor} strokeWidth="6" strokeLinecap="round" />
        {vehicle.variant % 5 === 4 && <circle cx="110" cy="94" r="19" fill="none" stroke={outline} strokeWidth="4" />}
      </>}

      {vehicle.type === 'motorcycle' && <>
        <circle cx="53" cy="96" r="24" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="53" cy="96" r="10" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="167" cy="96" r="24" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="167" cy="96" r="10" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d="M53 96 L88 67 L127 69 L167 96 L121 96 L94 96 L82 79 L72 79" fill="none" stroke={outline} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M85 65 Q101 51 123 61 L137 74 L108 79 L88 76Z" fill={vehicle.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M93 54 L121 54 M126 68 L146 46" stroke={vehicle.accentColor} strokeWidth="6" strokeLinecap="round" />
        <path d="M42 67 L62 67" stroke={outline} strokeWidth="5" strokeLinecap="round" />
      </>}
    </svg>
  );
}

function VehiclePartArtwork({ part }: { part: VehiclePart }) {
  const outline = '#263044';

  return (
    <svg viewBox="0 0 100 70" className="h-full w-full" aria-hidden="true">
      {part.vehicleType === 'car' && part.partIndex === 0 && <>
        <circle cx="50" cy="35" r="28" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="50" cy="35" r="15" fill="#b9bbc4" stroke={outline} strokeWidth="4" />
        <circle cx="50" cy="35" r="6" fill="#737780" />
      </>}
      {part.vehicleType === 'car' && part.partIndex === 1 && <>
        <path d="M13 57 L18 25 Q20 17 31 16 L69 16 Q78 18 82 29 L87 57Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M35 22 L66 22 L73 37 L35 37Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M21 47 L80 47" stroke={part.accentColor} strokeWidth="5" />
      </>}
      {part.vehicleType === 'tractor' && part.partIndex === 0 && <>
        <circle cx="50" cy="35" r="29" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="50" cy="35" r="13" fill="#aeb5ba" stroke={outline} strokeWidth="4" />
        <circle cx="50" cy="35" r="5" fill="#737780" />
      </>}
      {part.vehicleType === 'tractor' && part.partIndex === 1 && <>
        <path d="M12 52 L15 29 L27 23 L77 23 L88 35 L87 56 L62 56 L58 42 L12 42Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M23 31 L70 31 M29 37 L65 37" stroke={part.accentColor} strokeWidth="5" />
      </>}
      {part.vehicleType === 'train' && part.partIndex === 0 && <>
        <circle cx="30" cy="38" r="20" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="30" cy="38" r="8" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <circle cx="70" cy="38" r="20" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="70" cy="38" r="8" fill="#b9bbc4" stroke={outline} strokeWidth="3" />
        <path d="M29 38 L71 38" stroke={part.accentColor} strokeWidth="6" />
      </>}
      {part.vehicleType === 'train' && part.partIndex === 1 && <>
        <path d="M30 58 L34 30 L39 11 L68 11 L74 31 L78 58Z" fill={part.accentColor} stroke={outline} strokeWidth="4" />
        <path d="M43 32 L64 32 L69 52 L39 52Z" fill={part.bodyColor} stroke={outline} strokeWidth="3" />
      </>}
      {part.vehicleType === 'helicopter' && part.partIndex === 0 && <>
        <path d="M11 20 L89 20 M48 20 L48 57" fill="none" stroke={outline} strokeWidth="7" strokeLinecap="round" />
        <path d="M19 15 L34 15 M62 15 L80 15" stroke={part.accentColor} strokeWidth="5" strokeLinecap="round" />
        <circle cx="48" cy="20" r="8" fill={part.bodyColor} stroke={outline} strokeWidth="3" />
      </>}
      {part.vehicleType === 'helicopter' && part.partIndex === 1 && <>
        <path d="M14 43 L64 26 L83 16 L90 22 L76 38 L65 49 L16 54Z" fill={part.accentColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M77 37 L85 15 M77 37 L95 43" stroke={outline} strokeWidth="5" strokeLinecap="round" />
        <circle cx="77" cy="37" r="6" fill={part.bodyColor} stroke={outline} strokeWidth="3" />
      </>}
      {['bus', 'truck', 'fire_engine', 'ambulance'].includes(part.vehicleType) && part.partIndex === 0 && <>
        <circle cx="50" cy="35" r="27" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="50" cy="35" r="13" fill="#b9bbc4" stroke={outline} strokeWidth="4" />
      </>}
      {part.vehicleType === 'bus' && part.partIndex === 1 && <>
        <path d="M22 58 L22 14 L76 14 L82 58Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M30 21 L48 21 L48 38 L30 38Z M55 21 L72 21 L74 38 L55 38Z" fill="#9fcee0" stroke={outline} strokeWidth="3" />
        <path d="M56 42 L76 42 L78 58 L56 58Z" fill={part.accentColor} stroke={outline} strokeWidth="3" />
      </>}
      {part.vehicleType === 'truck' && part.partIndex === 1 && <>
        <path d="M14 17 L86 17 L82 58 L18 58Z" fill={part.accentColor} stroke={outline} strokeWidth="4" />
        <path d="M23 27 L76 27 M23 38 L76 38 M23 49 L76 49" stroke={part.bodyColor} strokeWidth="4" />
      </>}
      {part.vehicleType === 'fire_engine' && part.partIndex === 1 && <>
        <path d="M17 56 L83 56 L83 48 L23 48 L23 40 L76 40 L76 32 L31 32 L31 24 L68 24 L68 15" fill="none" stroke={part.accentColor} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M18 60 L84 60" stroke={outline} strokeWidth="4" />
      </>}
      {part.vehicleType === 'ambulance' && part.partIndex === 1 && <>
        <path d="M20 20 L80 20 L80 52 L20 52Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" />
        <path d="M43 25 L57 25 L57 32 L65 32 L65 42 L57 42 L57 49 L43 49 L43 42 L35 42 L35 32 L43 32Z" fill="#e45b55" />
        <path d="M34 13 L66 13" stroke={part.accentColor} strokeWidth="7" strokeLinecap="round" />
      </>}
      {part.vehicleType === 'airplane' && part.partIndex === 0 && <>
        <path d="M13 34 L47 29 L57 10 L69 10 L67 29 L89 32 L89 40 L67 43 L69 61 L57 61 L47 44 L13 40Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M50 30 L57 13 M50 43 L57 59" stroke={part.accentColor} strokeWidth="5" />
      </>}
      {part.vehicleType === 'airplane' && part.partIndex === 1 && <>
        <path d="M18 35 L56 29 L75 15 L83 20 L69 36 L83 51 L75 56 L56 43 L18 39Z" fill={part.accentColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M56 29 L61 10 M56 43 L61 61" stroke={part.bodyColor} strokeWidth="5" />
      </>}
      {part.vehicleType === 'boat' && part.partIndex === 0 && <>
        <path d="M17 42 L83 42 L73 57 Q49 65 27 57Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M28 63 Q48 57 68 63 Q78 66 86 63" fill="none" stroke="#69b8d2" strokeWidth="5" strokeLinecap="round" />
      </>}
      {part.vehicleType === 'boat' && part.partIndex === 1 && <>
        <path d="M50 58 L50 10 L82 53Z" fill={part.accentColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M44 58 L44 22 L20 53Z" fill="#f7edcf" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
      </>}
      {part.vehicleType === 'bicycle' && part.partIndex === 0 && <>
        <circle cx="31" cy="35" r="20" fill="none" stroke={outline} strokeWidth="4" />
        <circle cx="70" cy="35" r="20" fill="none" stroke={outline} strokeWidth="4" />
        <path d="M31 35 L49 13 L70 35 L31 35 L43 35 L57 13 L77 13" fill="none" stroke={part.bodyColor} strokeWidth="5" strokeLinejoin="round" />
      </>}
      {part.vehicleType === 'bicycle' && part.partIndex === 1 && <>
        <path d="M21 51 L43 51 L50 30 L61 30 L73 51 L87 51 M48 30 L37 17 M60 30 L75 17" fill="none" stroke={outline} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 16 L42 16 M70 16 L82 16" stroke={part.accentColor} strokeWidth="6" strokeLinecap="round" />
      </>}
      {part.vehicleType === 'motorcycle' && part.partIndex === 0 && <>
        <circle cx="50" cy="35" r="28" fill="#30313a" stroke={outline} strokeWidth="4" />
        <circle cx="50" cy="35" r="13" fill="#b9bbc4" stroke={outline} strokeWidth="4" />
      </>}
      {part.vehicleType === 'motorcycle' && part.partIndex === 1 && <>
        <path d="M18 43 Q30 28 45 29 L69 34 L83 48 L76 55 L28 55Z" fill={part.bodyColor} stroke={outline} strokeWidth="4" strokeLinejoin="round" />
        <path d="M32 29 L69 29" stroke={part.accentColor} strokeWidth="6" strokeLinecap="round" />
      </>}
    </svg>
  );
}

export const VehiclePuzzle: React.FC<VehiclePuzzleProps> = ({
  player,
  onUpdateStats,
  onBack,
  isMuted,
  onToggleMute,
}) => {
  const [vehicleCount, setVehicleCount] = useState(MIN_VEHICLES_PER_ROUND);
  const [round, setRound] = useState(() => generateVehiclePuzzle(MIN_VEHICLES_PER_ROUND));
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [draggingPartId, setDraggingPartId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'wrong' | 'correct' | null>(null);
  const [complete, setComplete] = useState(false);
  const matchedCount = Object.keys(connections).length;

  const connectPart = useCallback((partId: string, vehicleId: string) => {
    if (complete || connections[partId]) return;
    const part = round.parts.find(({ id }) => id === partId);
    if (!part || part.vehicleId !== vehicleId) {
      sound.playWrong();
      setFeedback('wrong');
      setSelectedPartId(null);
      return;
    }

    const nextConnections = { ...connections, [partId]: vehicleId };
    setConnections(nextConnections);
    setSelectedPartId(null);
    setFeedback('correct');
    sound.playCorrect();

    if (Object.keys(nextConnections).length === round.parts.length) {
      setComplete(true);
      sound.playFanfare();
      onUpdateStats(3, 10, round.parts.length);
    }
  }, [complete, connections, onUpdateStats, round.parts]);

  useEffect(() => {
    if (!draggingPartId) return;

    const handlePointerUp = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>('[data-vehicle-id]');
      if (target?.dataset.vehicleId) connectPart(draggingPartId, target.dataset.vehicleId);
      setDraggingPartId(null);
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [connectPart, draggingPartId]);

  const startNewRound = (count = vehicleCount) => {
    setVehicleCount(count);
    setRound(generateVehiclePuzzle(count));
    setConnections({});
    setSelectedPartId(null);
    setDraggingPartId(null);
    setFeedback(null);
    setComplete(false);
  };

  const partRows = new Map(round.parts.map((part, index) => [part.id, index]));
  const vehicleRows = new Map(round.vehicles.map((vehicle, index) => [vehicle.id, index]));
  const boardHeight = Math.max(round.parts.length * 68 - 8, round.vehicles.length * 138 - 8);
  const matchedPartsPerVehicle = new Map<string, number>();
  for (const vehicleId of Object.values(connections)) {
    matchedPartsPerVehicle.set(vehicleId, (matchedPartsPerVehicle.get(vehicleId) || 0) + 1);
  }

  return (
    <main className="h-[100dvh] min-h-[100dvh] overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,#fff7df_0%,#f9e9c8_55%,#f1dcb8_100%)] px-3 py-3 text-slate-800 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3">
          <button onClick={onBack} aria-label="Zurück zur Spielauswahl" className="rounded-2xl border-2 border-amber-200 bg-white/90 p-3 shadow-sm transition hover:bg-white active:scale-95">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-extrabold text-sky-700 sm:text-sm">{player.name} · {player.scores.vehicle_puzzle || 0} Punkte</p>
            <h1 className="font-['Fredoka'] text-xl font-black text-indigo-950 sm:text-4xl">Puzzle-Rätsel: Verkehrsmittel</h1>
            <p className="text-xs font-bold text-slate-600 sm:text-sm">Vorschulblock · Logisches Denken · ab 5 Jahre</p>
          </div>
          <button onClick={onToggleMute} aria-label={isMuted ? 'Ton einschalten' : 'Ton ausschalten'} className="rounded-2xl border-2 border-amber-200 bg-white/90 p-3 shadow-sm transition hover:bg-white active:scale-95">
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </header>

        <section className="mt-5 rounded-[2rem] border-[5px] border-white bg-[#fffdf6] p-3 shadow-[0_16px_50px_rgba(114,76,27,.18)] sm:mt-7 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-['Fredoka'] text-xl font-black text-indigo-950 sm:text-2xl">Was gehört wohin?</h2>
              <p className="max-w-xl text-sm font-bold text-slate-600 sm:text-base">Ziehe jedes Teil zum passenden Verkehrsmittel. Zwei Teile gehören zu jedem Fahrzeug.</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="vehicle-count" className="flex flex-col rounded-2xl bg-sky-100 px-3 py-2 text-xs font-black text-sky-900">
                <span>Fahrzeuge pro Runde</span>
                <select
                  id="vehicle-count"
                  value={vehicleCount}
                  onChange={(event) => startNewRound(Number(event.target.value))}
                  className="mt-1 rounded-lg border border-sky-200 bg-white px-2 py-1 text-base font-black text-indigo-950 outline-offset-2"
                >
                  {Array.from(
                    { length: MAX_VEHICLES_PER_ROUND - MIN_VEHICLES_PER_ROUND + 1 },
                    (_, index) => MIN_VEHICLES_PER_ROUND + index,
                  ).map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <div className="min-w-24 rounded-2xl bg-amber-100 px-3 py-2 text-center">
                <span className="block text-xs font-black uppercase tracking-wide text-amber-800">Geschafft</span>
                <span className="font-['Fredoka'] text-xl font-black text-amber-950">{matchedCount} / {round.parts.length}</span>
              </div>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3 px-1 text-center text-xs font-black uppercase tracking-wider text-slate-500 sm:gap-6 sm:text-sm">
            <span>Die Teile</span>
            <span>Die Verkehrsmittel</span>
          </div>

          <div className="relative">
            <svg viewBox={`0 0 1000 ${boardHeight}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
              {Object.entries(connections).map(([partId, vehicleId]) => {
                const startY = 30 + (partRows.get(partId) ?? 0) * 68;
                const endY = 65 + (vehicleRows.get(vehicleId) ?? 0) * 138;
                return <path key={partId} d={`M240 ${startY} C410 ${startY}, 590 ${endY}, 760 ${endY}`} fill="none" stroke="#5d9bb8" strokeWidth="7" strokeLinecap="round" opacity=".8" />;
              })}
            </svg>

            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div className="flex flex-col gap-2">
                {round.parts.map((part, index) => {
                  const matched = Boolean(connections[part.id]);
                  const selected = selectedPartId === part.id || draggingPartId === part.id;
                  return <button
                    key={part.id}
                    type="button"
                    disabled={matched || complete}
                    onPointerDown={() => {
                      if (matched || complete) return;
                      setDraggingPartId(part.id);
                      setSelectedPartId(part.id);
                      setFeedback(null);
                    }}
                    onClick={() => {
                      if (!matched && !complete) {
                        setSelectedPartId(part.id);
                        setFeedback(null);
                      }
                    }}
                    aria-label={`Teil ${index + 1}: ${part.name} auswählen oder ziehen`}
                    className={`relative z-10 flex h-[60px] touch-none items-center gap-1 rounded-xl border-[3px] bg-white px-1 shadow-[0_3px_0_#e8dcc5] transition sm:rounded-2xl sm:px-2 ${matched ? 'border-emerald-300 bg-emerald-50 opacity-70' : selected ? 'border-sky-500 ring-4 ring-sky-200' : 'border-amber-100 hover:border-amber-300'} ${matched || complete ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                  >
                    <span className="h-12 w-14 shrink-0 sm:w-16"><VehiclePartArtwork part={part} /></span>
                    <span className="min-w-0 text-left text-[10px] font-black text-slate-600 sm:text-xs">Teil {index + 1}</span>
                    {matched && <span className="ml-auto text-sm" aria-hidden="true">✓</span>}
                  </button>;
                })}
              </div>

              <div className="flex flex-col gap-2">
                {round.vehicles.map((vehicle, index) => {
                  const matchedCount = matchedPartsPerVehicle.get(vehicle.id) || 0;
                  const matched = matchedCount === 2;
                  return <button
                    key={vehicle.id}
                    type="button"
                    data-vehicle-id={vehicle.id}
                    disabled={matched || complete}
                    onClick={() => {
                      if (selectedPartId) connectPart(selectedPartId, vehicle.id);
                    }}
                    aria-label={`${vehicle.name} als Ziel auswählen`}
                    className={`relative z-10 flex h-[130px] flex-col items-center justify-center rounded-2xl border-[3px] px-1 shadow-[0_4px_0_#e8dcc5] transition ${matched ? 'border-emerald-300 bg-emerald-50 opacity-70' : 'border-slate-200 bg-white hover:border-sky-300'} ${matched || complete ? 'cursor-default' : 'cursor-crosshair'}`}
                  >
                    <span className="h-[92px] w-full max-w-[190px]"><VehicleArtwork vehicle={vehicle} /></span>
                    <span className="max-w-full truncate px-1 font-['Fredoka'] text-[10px] font-black leading-tight text-indigo-950 sm:text-xs">{vehicle.name}</span>
                    <span className="absolute right-2 top-1 text-[10px] font-black text-slate-500">{matchedCount}/2</span>
                  </button>;
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 min-h-8 text-center" aria-live="polite">
            {feedback === 'wrong' && <p className="font-black text-rose-600">Das passt noch nicht. Suche das passende Fahrzeugteil!</p>}
            {feedback === 'correct' && !complete && <p className="font-black text-emerald-700">Genau! Dieses Teil gehört dazu!</p>}
            {!feedback && !complete && <p className="text-sm font-bold text-slate-500">Du kannst auch erst ein Teil und dann ein Fahrzeug antippen.</p>}
          </div>
        </section>

        {complete && <section className="mt-5 rounded-[2rem] border-4 border-amber-300 bg-white p-5 text-center shadow-lg sm:p-7">
          <div className="mb-2 text-5xl" aria-hidden="true">🎉🚗🚁</div>
          <h2 className="font-['Fredoka'] text-2xl font-black text-indigo-950 sm:text-3xl">Alle Teile gefunden!</h2>
          <p className="mt-1 font-bold text-slate-600">Du hast alle {round.parts.length} Teile an {round.vehicles.length} Fahrzeuge verteilt. Toll gemacht!</p>
          <div className="my-3 flex items-center justify-center gap-2 font-black text-amber-600"><Trophy className="h-5 w-5" />{round.parts.length} von {round.parts.length} richtig</div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => startNewRound()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-black text-white shadow-md transition hover:bg-sky-500 active:scale-95"><RefreshCw className="h-5 w-5" />Neue Verkehrsmittel</button>
            <button onClick={onBack} className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-amber-950 shadow-md transition hover:bg-amber-300 active:scale-95">Zur Spielauswahl</button>
          </div>
        </section>}
      </div>
    </main>
  );
};
