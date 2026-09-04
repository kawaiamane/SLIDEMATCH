/**
 * Expansion Card Pools and Configurations
 */
const MOD_CARDS = {
    newcard: [
        { id: 'n_replace', tag: 'new', name: 'REPLACE', desc: '自分の駒と隣接する駒を入れ替える' },
        { id: 'n_delete', tag: 'new', name: 'DELETE', desc: '相手の駒を1つ消去する' },
        { id: 'n_shuffle', tag: 'new', name: 'SHUFFLE', desc: '盤面全体の配置をシャッフルする' },
        { id: 'n_double', tag: 'new', name: 'DBL TURN', desc: '使用後、もう一度自分のターンになる' },
        { id: 'n_steal', tag: 'new', name: 'STEAL', desc: '相手の駒を自分の駒に奪う' },
        { id: 'n_wild', tag: 'new', name: 'WILD', desc: '空きマスに自分の駒を1つ配置する' },
        { id: 'n_bomb', tag: 'new', name: 'CROSS BOMB', desc: '指定マスとその上下左右を消去する' },
        { id: 'n_flip', tag: 'new', name: 'ROW FLIP', desc: '指定した横一列の駒の白黒を反転する' },
        { id: 'n_growth', tag: 'new', name: 'GROWTH', desc: '空きマスにランダムに3つ自分の駒を置く' },
        { id: 'n_trade', tag: 'new', name: 'TRADE', desc: '相手の駒をランダムに3つ消去する' }
    ],
    min: [
        { id: 'm_minus1', tag: 'min', name: 'MINUS 1', desc: '相手の残り手数を直接1減らす' },
        { id: 'm_minus3', tag: 'min', name: 'MINUS 3', desc: '相手の残り手数を直接3減らす' },
        { id: 'm_clear_row', tag: 'min', name: 'MIN ROW', desc: '最も駒が少ない列を丸ごと全消去する' },
        { id: 'm_half', tag: 'min', name: 'HALF CUT', desc: '盤面上の駒をランダムに8個消去する' },
        { id: 'm_redraw', tag: 'min', name: 'RE-DRAW', desc: '手札をすべて捨てて引き直す' },
        { id: 'm_isolated', tag: 'min', name: 'ISOLATE', desc: '孤立した空きマスに自分の駒を置く' },
        { id: 'm_enemy_down', tag: 'min', name: 'FOE DROP', desc: '相手の駒をランダムに3つ消去する' },
        { id: 'm_dice', tag: 'min', name: 'MIN DICE', desc: 'ダイスを振り、出た数だけ相手の駒を消す' },
        { id: 'm_compress', tag: 'min', name: 'COMPRESS', desc: '盤面の外周にある駒を4つ消去する' },
        { id: 'm_equal', tag: 'min', name: 'EQUAL', desc: '点数が多い方の残り手数を1減らす' }
    ],
    ringo: [
        { id: 'r_apple', tag: 'rin', name: 'APPLE', desc: '空きマスに自分の駒を1つ配置する' },
        { id: 'r_poison', tag: 'rin', name: 'POISON', desc: '相手の駒を消し、自分の手数を1減らす' },
        { id: 'r_seed', tag: 'rin', name: 'SEED', desc: '空きマスにランダムに4つ自分の駒を置く' },
        { id: 'r_juicer', tag: 'rin', name: 'JUICER', desc: '指定した2x2マスをすべて消去する' },
        { id: 'r_tree', tag: 'rin', name: 'TREE', desc: '指定した縦一列のマスをすべて自分の駒にする' },
        { id: 'r_peel', tag: 'rin', name: 'PEEL', desc: '外周にある相手の駒を最大5つ消去する' },
        { id: 'r_sweet', tag: 'rin', name: 'SWEET', desc: 'もう一度自分のターンを行う' },
        { id: 'r_roulette', tag: 'rin', name: 'RINGO ROULETTE', desc: '1D10のダイスを振り、出た目の数だけ自分の駒を消去する' },
        { id: 'r_gold', tag: 'rin', name: 'GOLDEN', desc: '手数を5減らし、自分の駒を2つ消去する' },
        { id: 'r_harvest', tag: 'rin', name: 'HARVEST', desc: '自分の盤面の駒の数(最大10)だけ相手の手数を減らす' }
    ],
    tantal: [
    { id: 't_wipe', tag: 'tnt', name: 'WIPE OUT', desc: '相手の駒を最大5個消去する' },
    { id: 't_dominate', tag: 'tnt', name: 'DOMINATE', desc: '相手の駒を最大3個自分の駒にする' },
    { id: 't_heal', tag: 'tnt', name: 'SUPER HEAL', desc: '自分の手数を10増やす' },
    { id: 't_eclipse', tag: 'tnt', name: 'ECLIPSE', desc: '相手の手数を10にする' },
    { id: 't_genesis', tag: 'tnt', name: 'GENESIS', desc: '空きマスを最大5個自分の駒で埋める' },
    { id: 't_meteor', tag: 'tnt', name: 'METEOR', desc: '相手の駒をランダムに最大3個消去する' },
    { id: 't_obliterate', tag: 'tnt', name: 'OBLITERATE', desc: '盤面からランダムに最大6個の駒を消去する' },
    { id: 't_swap', tag: 'tnt', name: 'TIME SWAP', desc: '相手と自分の手数を入れ替える' },
    { id: 't_steal_count', tag: 'tnt', name: 'STEAL TIME', desc: '相手の手数を5奪う' },
    { id: 't_wealth', tag: 'tnt', name: 'WEALTH', desc: '自分の手数を1.25倍にする' }
]
};
