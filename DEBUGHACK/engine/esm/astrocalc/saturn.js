// Originally `AASATURN.CPP`
// "Purpose: Implementation for the algorithms which obtain the heliocentric position of Saturn"
// Last update of original: PJN / 31-05-2004
//
// Translated into C# and released by Microsoft, then transpiled into JavaScript
// by ScriptSharp, for the WorldWide Telescope project.
//
// The legal notices in the original code are as follows:
//
// Copyright (c) 2003 - 2007 by PJ Naughter (Web: www.naughter.com, Email: pjna@naughter.com)
//
// All rights reserved.
//
// Copyright / Usage Details:
//
// You are allowed to include the source code in any product (commercial, shareware, freeware or otherwise)
// when your product is released in binary form. You are allowed to modify the source code in any way you want
// except you cannot modify the copyright details at the top of each module. If you want to distribute source
// code with your application, then you are only allowed to distribute versions released by the author. This is
// to maintain a single distribution point for the source code.

import { registerType } from "../typesystem.js";
import { CT } from "./coordinate_transformation.js";
import { VSC } from "./earth.js";


// Coefficients

const g_L0SaturnCoefficients = [new VSC(87401354, 0, 0), new VSC(11107660, 3.9620509, 213.29909544), new VSC(1414151, 4.5858152, 7.113547), new VSC(398379, 0.52112, 206.185548), new VSC(350769, 3.303299, 426.598191), new VSC(206816, 0.246584, 103.092774), new VSC(79271, 3.84007, 220.41264), new VSC(23990, 4.66977, 110.20632), new VSC(16574, 0.43719, 419.48464), new VSC(15820, 0.93809, 632.78374), new VSC(15054, 2.7167, 639.89729), new VSC(14907, 5.76903, 316.39187), new VSC(14610, 1.56519, 3.93215), new VSC(13160, 4.44891, 14.22709), new VSC(13005, 5.98119, 11.0457), new VSC(10725, 3.1294, 202.2534), new VSC(6126, 1.7633, 277.035), new VSC(5863, 0.2366, 529.691), new VSC(5228, 4.2078, 3.1814), new VSC(5020, 3.1779, 433.7117), new VSC(4593, 0.6198, 199.072), new VSC(4006, 2.2448, 63.7359), new VSC(3874, 3.2228, 138.5175), new VSC(3269, 0.7749, 949.1756), new VSC(2954, 0.9828, 95.9792), new VSC(2461, 2.0316, 735.8765), new VSC(1758, 3.2658, 522.5774), new VSC(1640, 5.505, 846.0828), new VSC(1581, 4.3727, 309.2783), new VSC(1391, 4.0233, 323.5054), new VSC(1124, 2.8373, 415.5525), new VSC(1087, 4.1834, 2.4477), new VSC(1017, 3.717, 227.5262), new VSC(957, 0.507, 1265.567), new VSC(853, 3.421, 175.166), new VSC(849, 3.191, 209.367), new VSC(789, 5.007, 0.963), new VSC(749, 2.144, 853.196), new VSC(744, 5.253, 224.345), new VSC(687, 1.747, 1052.268), new VSC(654, 1.599, 0.048), new VSC(634, 2.299, 412.371), new VSC(625, 0.97, 210.118), new VSC(580, 3.093, 74.782), new VSC(546, 2.127, 350.332), new VSC(543, 1.518, 9.561), new VSC(530, 4.449, 117.32), new VSC(478, 2.965, 137.033), new VSC(474, 5.475, 742.99), new VSC(452, 1.044, 490.334), new VSC(449, 1.29, 127.472), new VSC(372, 2.278, 217.231), new VSC(355, 3.013, 838.969), new VSC(347, 1.539, 340.771), new VSC(343, 0.246, 0.521), new VSC(330, 0.247, 1581.959), new VSC(322, 0.961, 203.738), new VSC(322, 2.572, 647.011), new VSC(309, 3.495, 216.48), new VSC(287, 2.37, 351.817), new VSC(278, 0.4, 211.815), new VSC(249, 1.47, 1368.66), new VSC(227, 4.91, 12.53), new VSC(220, 4.204, 200.769), new VSC(209, 1.345, 625.67), new VSC(208, 0.483, 1162.475), new VSC(208, 1.283, 39.357), new VSC(204, 6.011, 265.989), new VSC(185, 3.503, 149.563), new VSC(184, 0.973, 4.193), new VSC(182, 5.491, 2.921), new VSC(174, 1.863, 0.751), new VSC(165, 0.44, 5.417), new VSC(149, 5.736, 52.69), new VSC(148, 1.535, 5.629), new VSC(146, 6.231, 195.14), new VSC(140, 4.295, 21.341), new VSC(131, 4.068, 10.295), new VSC(125, 6.277, 1898.351), new VSC(122, 1.976, 4.666), new VSC(118, 5.341, 554.07), new VSC(117, 2.679, 1155.361), new VSC(114, 5.594, 1059.382), new VSC(112, 1.105, 191.208), new VSC(110, 0.166, 1.484), new VSC(109, 3.438, 536.805), new VSC(107, 4.012, 956.289), new VSC(104, 2.192, 88.866), new VSC(103, 1.197, 1685.052), new VSC(101, 4.965, 269.921)];
const g_L1SaturnCoefficients = [new VSC(21354295596, 0, 0), new VSC(1296855, 1.8282054, 213.2990954), new VSC(564348, 2.885001, 7.113547), new VSC(107679, 2.277699, 206.185548), new VSC(98323, 1.0807, 426.59819), new VSC(40255, 2.04128, 220.41264), new VSC(19942, 1.27955, 103.09277), new VSC(10512, 2.7488, 14.22709), new VSC(6939, 0.4049, 639.8973), new VSC(4803, 2.4419, 419.4846), new VSC(4056, 2.9217, 110.2063), new VSC(3769, 3.6497, 3.9322), new VSC(3385, 2.4169, 3.1814), new VSC(3302, 1.2626, 433.7117), new VSC(3071, 2.3274, 199.072), new VSC(1953, 3.5639, 11.0457), new VSC(1249, 2.628, 95.9792), new VSC(922, 1.961, 227.526), new VSC(706, 4.417, 529.691), new VSC(650, 6.174, 202.253), new VSC(628, 6.111, 309.278), new VSC(487, 6.04, 853.196), new VSC(479, 4.988, 522.577), new VSC(468, 4.617, 63.736), new VSC(417, 2.117, 323.505), new VSC(408, 1.299, 209.367), new VSC(352, 2.317, 632.784), new VSC(344, 3.959, 412.371), new VSC(340, 3.634, 316.392), new VSC(336, 3.772, 735.877), new VSC(332, 2.861, 210.118), new VSC(289, 2.733, 117.32), new VSC(281, 5.744, 2.448), new VSC(266, 0.543, 647.011), new VSC(230, 1.644, 216.48), new VSC(192, 2.965, 224.345), new VSC(173, 4.077, 846.083), new VSC(167, 2.597, 21.341), new VSC(136, 2.286, 10.295), new VSC(131, 3.441, 742.99), new VSC(128, 4.095, 217.231), new VSC(109, 6.161, 415.552), new VSC(98, 4.73, 838.97), new VSC(94, 3.48, 1052.27), new VSC(92, 3.95, 88.87), new VSC(87, 1.22, 440.83), new VSC(83, 3.11, 625.67), new VSC(78, 6.24, 302.16), new VSC(67, 0.29, 4.67), new VSC(66, 5.65, 9.56), new VSC(62, 4.29, 127.47), new VSC(62, 1.83, 195.14), new VSC(58, 2.48, 191.96), new VSC(57, 5.02, 137.03), new VSC(55, 0.28, 74.78), new VSC(54, 5.13, 490.33), new VSC(51, 1.46, 536.8), new VSC(47, 1.18, 149.56), new VSC(47, 5.15, 515.46), new VSC(46, 2.23, 956.29), new VSC(44, 2.71, 5.42), new VSC(40, 0.41, 269.92), new VSC(40, 3.89, 728.76), new VSC(38, 0.65, 422.67), new VSC(38, 2.53, 12.53), new VSC(37, 3.78, 2.92), new VSC(35, 6.08, 5.63), new VSC(34, 3.21, 1368.66), new VSC(33, 4.64, 277.03), new VSC(33, 5.43, 1066.5), new VSC(33, 0.3, 351.82), new VSC(32, 4.39, 1155.36), new VSC(31, 2.43, 52.69), new VSC(30, 2.84, 203), new VSC(30, 6.19, 284.15), new VSC(30, 3.39, 1059.38), new VSC(29, 2.03, 330.62), new VSC(28, 2.74, 265.99), new VSC(26, 4.51, 340.77)];
const g_L2SaturnCoefficients = [new VSC(116441, 1.179879, 7.113547), new VSC(91921, 0.07425, 213.2991), new VSC(90592, 0, 0), new VSC(15277, 4.06492, 206.18555), new VSC(10631, 0.25778, 220.41264), new VSC(10605, 5.40964, 426.59819), new VSC(4265, 1.046, 14.2271), new VSC(1216, 2.9186, 103.0928), new VSC(1165, 4.6094, 639.8973), new VSC(1082, 5.6913, 433.7117), new VSC(1045, 4.0421, 199.072), new VSC(1020, 0.6337, 3.1814), new VSC(634, 4.388, 419.485), new VSC(549, 5.573, 3.932), new VSC(457, 1.268, 110.206), new VSC(425, 0.209, 227.526), new VSC(274, 4.288, 95.979), new VSC(162, 1.381, 11.046), new VSC(129, 1.566, 309.278), new VSC(117, 3.881, 853.196), new VSC(105, 4.9, 647.011), new VSC(101, 0.893, 21.341), new VSC(96, 2.91, 316.39), new VSC(95, 5.63, 412.37), new VSC(85, 5.73, 209.37), new VSC(83, 6.05, 216.48), new VSC(82, 1.02, 117.32), new VSC(75, 4.76, 210.12), new VSC(67, 0.46, 522.58), new VSC(66, 0.48, 10.29), new VSC(64, 0.35, 323.51), new VSC(61, 4.88, 632.78), new VSC(53, 2.75, 529.69), new VSC(46, 5.69, 440.83), new VSC(45, 1.67, 202.25), new VSC(42, 5.71, 88.87), new VSC(32, 0.07, 63.74), new VSC(32, 1.67, 302.16), new VSC(31, 4.16, 191.96), new VSC(27, 0.83, 224.34), new VSC(25, 5.66, 735.88), new VSC(20, 5.94, 217.23), new VSC(18, 4.9, 625.67), new VSC(17, 1.63, 742.99), new VSC(16, 0.58, 515.46), new VSC(14, 0.21, 838.97), new VSC(14, 3.76, 195.14), new VSC(12, 4.72, 203), new VSC(12, 0.13, 234.64), new VSC(12, 3.12, 846.08), new VSC(11, 5.92, 536.8), new VSC(11, 5.6, 728.76), new VSC(11, 3.2, 1066.5), new VSC(10, 4.99, 422.67), new VSC(10, 0.26, 330.62), new VSC(10, 4.15, 860.31), new VSC(9, 0.46, 956.29), new VSC(8, 2.14, 269.92), new VSC(8, 5.25, 429.78), new VSC(8, 4.03, 9.56), new VSC(7, 5.4, 1052.27), new VSC(6, 4.46, 284.15), new VSC(6, 5.93, 405.26)];
const g_L3SaturnCoefficients = [new VSC(16039, 5.73945, 7.11355), new VSC(4250, 4.5854, 213.2991), new VSC(1907, 4.7608, 220.4126), new VSC(1466, 5.9133, 206.1855), new VSC(1162, 5.6197, 14.2271), new VSC(1067, 3.6082, 426.5982), new VSC(239, 3.861, 433.712), new VSC(237, 5.768, 199.072), new VSC(166, 5.116, 3.181), new VSC(151, 2.736, 639.897), new VSC(131, 4.743, 227.526), new VSC(63, 0.23, 419.48), new VSC(62, 4.74, 103.09), new VSC(40, 5.47, 21.34), new VSC(40, 5.96, 95.98), new VSC(39, 5.83, 110.21), new VSC(28, 3.01, 647.01), new VSC(25, 0.99, 3.93), new VSC(19, 1.92, 853.2), new VSC(18, 4.97, 10.29), new VSC(18, 1.03, 412.37), new VSC(18, 4.2, 216.48), new VSC(18, 3.32, 309.28), new VSC(16, 3.9, 440.83), new VSC(16, 5.62, 117.32), new VSC(13, 1.18, 88.87), new VSC(11, 5.58, 11.05), new VSC(11, 5.93, 191.96), new VSC(10, 3.95, 209.37), new VSC(9, 3.39, 302.16), new VSC(8, 4.88, 323.51), new VSC(7, 0.38, 632.78), new VSC(6, 2.25, 522.58), new VSC(6, 1.06, 210.12), new VSC(5, 4.64, 234.64), new VSC(4, 3.14, 0), new VSC(4, 2.31, 515.46), new VSC(3, 2.2, 860.31), new VSC(3, 0.59, 529.69), new VSC(3, 4.93, 224.34), new VSC(3, 0.42, 625.67), new VSC(2, 4.77, 330.62), new VSC(2, 3.35, 429.78), new VSC(2, 3.2, 202.25), new VSC(2, 1.19, 1066.5), new VSC(2, 1.35, 405.26), new VSC(2, 4.16, 223.59), new VSC(2, 3.07, 654.12)];
const g_L4SaturnCoefficients = [new VSC(1662, 3.9983, 7.1135), new VSC(257, 2.984, 220.413), new VSC(236, 3.902, 14.227), new VSC(149, 2.741, 213.299), new VSC(114, 3.142, 0), new VSC(110, 1.515, 206.186), new VSC(68, 1.72, 426.6), new VSC(40, 2.05, 433.71), new VSC(38, 1.24, 199.07), new VSC(31, 3.01, 227.53), new VSC(15, 0.83, 639.9), new VSC(9, 3.71, 21.34), new VSC(6, 2.42, 419.48), new VSC(6, 1.16, 647.01), new VSC(4, 1.45, 95.98), new VSC(4, 2.12, 440.83), new VSC(3, 4.09, 110.21), new VSC(3, 2.77, 412.37), new VSC(3, 3.01, 88.87), new VSC(3, 0, 853.2), new VSC(3, 0.39, 103.09), new VSC(2, 3.78, 117.32), new VSC(2, 2.83, 234.64), new VSC(2, 5.08, 309.28), new VSC(2, 2.24, 216.48), new VSC(2, 5.19, 302.16), new VSC(1, 1.55, 191.96)];
const g_L5SaturnCoefficients = [new VSC(124, 2.259, 7.114), new VSC(34, 2.16, 14.23), new VSC(28, 1.2, 220.41), new VSC(6, 1.22, 227.53), new VSC(5, 0.24, 433.71), new VSC(4, 6.23, 426.6), new VSC(3, 2.97, 199.07), new VSC(3, 4.29, 206.19), new VSC(2, 6.25, 213.3), new VSC(1, 5.28, 639.9), new VSC(1, 0.24, 440.83), new VSC(1, 3.14, 0)];
const g_B0SaturnCoefficients = [new VSC(4330678, 3.6028443, 213.2990954), new VSC(240348, 2.852385, 426.598191), new VSC(84746, 0, 0), new VSC(34116, 0.57297, 206.18555), new VSC(30863, 3.48442, 220.41264), new VSC(14734, 2.11847, 639.89729), new VSC(9917, 5.79, 419.4846), new VSC(6994, 4.736, 7.1135), new VSC(4808, 5.4331, 316.3919), new VSC(4788, 4.9651, 110.2063), new VSC(3432, 2.7326, 433.7117), new VSC(1506, 6.013, 103.0928), new VSC(1060, 5.631, 529.691), new VSC(969, 5.204, 632.784), new VSC(942, 1.396, 853.196), new VSC(708, 3.803, 323.505), new VSC(552, 5.131, 202.253), new VSC(400, 3.359, 227.526), new VSC(319, 3.626, 209.367), new VSC(316, 1.997, 647.011), new VSC(314, 0.465, 217.231), new VSC(284, 4.886, 224.345), new VSC(236, 2.139, 11.046), new VSC(215, 5.95, 846.083), new VSC(209, 2.12, 415.552), new VSC(207, 0.73, 199.072), new VSC(179, 2.954, 63.736), new VSC(141, 0.644, 490.334), new VSC(139, 4.595, 14.227), new VSC(139, 1.998, 735.877), new VSC(135, 5.245, 742.99), new VSC(122, 3.115, 522.577), new VSC(116, 3.109, 216.48), new VSC(114, 0.963, 210.118)];
const g_B1SaturnCoefficients = [new VSC(397555, 5.3329, 213.299095), new VSC(49479, 3.14159, 0), new VSC(18572, 6.09919, 426.59819), new VSC(14801, 2.30586, 206.18555), new VSC(9644, 1.6967, 220.4126), new VSC(3757, 1.2543, 419.4846), new VSC(2717, 5.9117, 639.8973), new VSC(1455, 0.8516, 433.7117), new VSC(1291, 2.9177, 7.1135), new VSC(853, 0.436, 316.392), new VSC(298, 0.919, 632.784), new VSC(292, 5.316, 853.196), new VSC(284, 1.619, 227.526), new VSC(275, 3.889, 103.093), new VSC(172, 0.052, 647.011), new VSC(166, 2.444, 199.072), new VSC(158, 5.209, 110.206), new VSC(128, 1.207, 529.691), new VSC(110, 2.457, 217.231), new VSC(82, 2.76, 210.12), new VSC(81, 2.86, 14.23), new VSC(69, 1.66, 202.25), new VSC(65, 1.26, 216.48), new VSC(61, 1.25, 209.37), new VSC(59, 1.82, 323.51), new VSC(46, 0.82, 440.83), new VSC(36, 1.82, 224.34), new VSC(34, 2.84, 117.32), new VSC(33, 1.31, 412.37), new VSC(32, 1.19, 846.08), new VSC(27, 4.65, 1066.5), new VSC(27, 4.44, 11.05)];
const g_B2SaturnCoefficients = [new VSC(20630, 0.50482, 213.2991), new VSC(3720, 3.9983, 206.1855), new VSC(1627, 6.1819, 220.4126), new VSC(1346, 0, 0), new VSC(706, 3.039, 419.485), new VSC(365, 5.099, 426.598), new VSC(330, 5.279, 433.712), new VSC(219, 3.828, 639.897), new VSC(139, 1.043, 7.114), new VSC(104, 6.157, 227.526), new VSC(93, 1.98, 316.39), new VSC(71, 4.15, 199.07), new VSC(52, 2.88, 632.78), new VSC(49, 4.43, 647.01), new VSC(41, 3.16, 853.2), new VSC(29, 4.53, 210.12), new VSC(24, 1.12, 14.23), new VSC(21, 4.35, 217.23), new VSC(20, 5.31, 440.83), new VSC(18, 0.85, 110.21), new VSC(17, 5.68, 216.48), new VSC(16, 4.26, 103.09), new VSC(14, 3, 412.37), new VSC(12, 2.53, 529.69), new VSC(8, 3.32, 202.25), new VSC(7, 5.56, 209.37), new VSC(7, 0.29, 323.51), new VSC(6, 1.16, 117.32), new VSC(6, 3.61, 869.31)];
const g_B3SaturnCoefficients = [new VSC(666, 1.99, 213.299), new VSC(632, 5.698, 206.186), new VSC(398, 0, 0), new VSC(188, 4.338, 220.413), new VSC(92, 4.84, 419.48), new VSC(52, 3.42, 433.71), new VSC(42, 2.38, 426.6), new VSC(26, 4.4, 227.53), new VSC(21, 5.85, 199.07), new VSC(18, 1.99, 639.9), new VSC(11, 5.37, 7.11), new VSC(10, 2.55, 647.01), new VSC(7, 3.46, 316.39), new VSC(6, 4.8, 632.78), new VSC(6, 0.02, 210.12), new VSC(6, 3.52, 440.83), new VSC(5, 5.64, 14.23), new VSC(5, 1.22, 853.2), new VSC(4, 4.71, 412.37), new VSC(3, 0.63, 103.09), new VSC(2, 3.72, 216.48)];
const g_B4SaturnCoefficients = [new VSC(80, 1.12, 206.19), new VSC(32, 3.12, 213.3), new VSC(17, 2.48, 220.41), new VSC(12, 3.14, 0), new VSC(9, 0.38, 419.48), new VSC(6, 1.56, 433.71), new VSC(5, 2.63, 227.53), new VSC(5, 1.28, 199.07), new VSC(1, 1.43, 426.6), new VSC(1, 0.67, 647.01), new VSC(1, 1.72, 440.83), new VSC(1, 6.18, 639.9)];
const g_B5SaturnCoefficients = [new VSC(8, 2.82, 206.19), new VSC(1, 0.51, 220.41)];
const g_R0SaturnCoefficients = [new VSC(955758136, 0, 0), new VSC(52921382, 2.3922622, 213.29909544), new VSC(1873680, 5.2354961, 206.1855484), new VSC(1464664, 1.6476305, 426.5981909), new VSC(821891, 5.9352, 316.39187), new VSC(547507, 5.015326, 103.092774), new VSC(371684, 2.271148, 220.412642), new VSC(361778, 3.139043, 7.113547), new VSC(140618, 5.704067, 632.783739), new VSC(108975, 3.293136, 110.206321), new VSC(69007, 5.941, 419.48464), new VSC(61053, 0.94038, 639.89729), new VSC(48913, 1.55733, 202.2534), new VSC(34144, 0.19519, 277.03499), new VSC(32402, 5.47085, 949.17561), new VSC(20937, 0.46349, 735.87651), new VSC(20839, 1.52103, 433.71174), new VSC(20747, 5.33256, 199.072), new VSC(15298, 3.05944, 529.69097), new VSC(14296, 2.60434, 323.50542), new VSC(12884, 1.64892, 138.5175), new VSC(11993, 5.98051, 846.08283), new VSC(11380, 1.73106, 522.57742), new VSC(9796, 5.2048, 1265.5675), new VSC(7753, 5.8519, 95.9792), new VSC(6771, 3.0043, 14.2271), new VSC(6466, 0.1773, 1052.2684), new VSC(5850, 1.4552, 415.5525), new VSC(5307, 0.5974, 63.7359), new VSC(4696, 2.1492, 227.5262), new VSC(4044, 1.6401, 209.3669), new VSC(3688, 0.7802, 412.3711), new VSC(3461, 1.8509, 175.1661), new VSC(3420, 4.9455, 1581.9593), new VSC(3401, 0.5539, 350.3321), new VSC(3376, 3.6953, 224.3448), new VSC(2976, 5.6847, 210.1177), new VSC(2885, 1.3876, 838.9693), new VSC(2881, 0.1796, 853.1964), new VSC(2508, 3.5385, 742.9901), new VSC(2448, 6.1841, 1368.6603), new VSC(2406, 2.9656, 117.3199), new VSC(2174, 0.0151, 340.7709), new VSC(2024, 5.0541, 11.0457)];
const g_R1SaturnCoefficients = [new VSC(6182981, 0.2584352, 213.2990954), new VSC(506578, 0.711147, 206.185548), new VSC(341394, 5.796358, 426.598191), new VSC(188491, 0.472157, 220.412642), new VSC(186262, 3.141593, 0), new VSC(143891, 1.407449, 7.113547), new VSC(49621, 6.01744, 103.09277), new VSC(20928, 5.09246, 639.89729), new VSC(19953, 1.1756, 419.48464), new VSC(18840, 1.6082, 110.20632), new VSC(13877, 0.75886, 199.072), new VSC(12893, 5.9433, 433.71174), new VSC(5397, 1.2885, 14.2271), new VSC(4869, 0.8679, 323.5054), new VSC(4247, 0.393, 227.5262), new VSC(3252, 1.2585, 95.9792), new VSC(3081, 3.4366, 522.5774), new VSC(2909, 4.6068, 202.2534), new VSC(2856, 2.1673, 735.8765), new VSC(1988, 2.4505, 412.3711), new VSC(1941, 6.0239, 209.3669), new VSC(1581, 1.2919, 210.1177), new VSC(1340, 4.308, 853.1964), new VSC(1316, 1.253, 117.3199), new VSC(1203, 1.8665, 316.3919), new VSC(1091, 0.0753, 216.4805), new VSC(966, 0.48, 632.784), new VSC(954, 5.152, 647.011), new VSC(898, 0.983, 529.691), new VSC(882, 1.885, 1052.268), new VSC(874, 1.402, 224.345), new VSC(785, 3.064, 838.969), new VSC(740, 1.382, 625.67), new VSC(658, 4.144, 309.278), new VSC(650, 1.725, 742.99), new VSC(613, 3.033, 63.736), new VSC(599, 2.549, 217.231), new VSC(503, 2.13, 3.932)];
const g_R2SaturnCoefficients = [new VSC(436902, 4.786717, 213.299095), new VSC(71923, 2.5007, 206.18555), new VSC(49767, 4.97168, 220.41264), new VSC(43221, 3.8694, 426.59819), new VSC(29646, 5.9631, 7.11355), new VSC(4721, 2.4753, 199.072), new VSC(4142, 4.1067, 433.7117), new VSC(3789, 3.0977, 639.8973), new VSC(2964, 1.3721, 103.0928), new VSC(2556, 2.8507, 419.4846), new VSC(2327, 0, 0), new VSC(2208, 6.2759, 110.2063), new VSC(2188, 5.8555, 14.2271), new VSC(1957, 4.9245, 227.5262), new VSC(924, 5.464, 323.505), new VSC(706, 2.971, 95.979), new VSC(546, 4.129, 412.371), new VSC(431, 5.178, 522.577), new VSC(405, 4.173, 209.367), new VSC(391, 4.481, 216.48), new VSC(374, 5.834, 117.32), new VSC(361, 3.277, 647.011), new VSC(356, 3.192, 210.118), new VSC(326, 2.269, 853.196), new VSC(207, 4.022, 735.877), new VSC(204, 0.088, 202.253), new VSC(180, 3.597, 632.784), new VSC(178, 4.097, 440.825), new VSC(154, 3.135, 625.67), new VSC(148, 0.136, 302.165), new VSC(133, 2.594, 191.958), new VSC(132, 5.933, 309.278)];
const g_R3SaturnCoefficients = [new VSC(20315, 3.02187, 213.2991), new VSC(8924, 3.1914, 220.4126), new VSC(6909, 4.3517, 206.1855), new VSC(4087, 4.2241, 7.1135), new VSC(3879, 2.0106, 426.5982), new VSC(1071, 4.2036, 199.072), new VSC(907, 2.283, 433.712), new VSC(606, 3.175, 227.526), new VSC(597, 4.135, 14.227), new VSC(483, 1.173, 639.897), new VSC(393, 0, 0), new VSC(229, 4.698, 419.485), new VSC(188, 4.59, 110.206), new VSC(150, 3.202, 103.093), new VSC(121, 3.768, 323.505), new VSC(102, 4.71, 95.979), new VSC(101, 5.819, 412.371), new VSC(93, 1.44, 647.01), new VSC(84, 2.63, 216.48), new VSC(73, 4.15, 117.32), new VSC(62, 2.31, 440.83), new VSC(55, 0.31, 853.2), new VSC(50, 2.39, 209.37), new VSC(45, 4.37, 191.96), new VSC(41, 0.69, 522.58), new VSC(40, 1.84, 302.16), new VSC(38, 5.94, 88.87), new VSC(32, 4.01, 21.34)];
const g_R4SaturnCoefficients = [new VSC(1202, 1.415, 220.4126), new VSC(708, 1.162, 213.299), new VSC(516, 6.24, 206.186), new VSC(427, 2.469, 7.114), new VSC(268, 0.187, 426.598), new VSC(170, 5.959, 199.072), new VSC(150, 0.48, 433.712), new VSC(145, 1.442, 227.526), new VSC(121, 2.405, 14.227), new VSC(47, 5.57, 639.9), new VSC(19, 5.86, 647.01), new VSC(17, 0.53, 440.83), new VSC(16, 2.9, 110.21), new VSC(15, 0.3, 419.48), new VSC(14, 1.3, 412.37), new VSC(13, 2.09, 323.51), new VSC(11, 0.22, 95.98), new VSC(11, 2.46, 117.32), new VSC(10, 3.14, 0), new VSC(9, 1.56, 88.87), new VSC(9, 2.28, 21.34), new VSC(9, 0.68, 216.48), new VSC(8, 1.27, 234.64)];
const g_R5SaturnCoefficients = [new VSC(129, 5.913, 220.413), new VSC(32, 0.69, 7.11), new VSC(27, 5.91, 227.53), new VSC(20, 4.95, 433.71), new VSC(20, 0.67, 14.23), new VSC(14, 2.67, 206.19), new VSC(14, 1.46, 199.07), new VSC(13, 4.59, 426.6), new VSC(7, 4.63, 213.3), new VSC(5, 3.61, 639.9), new VSC(4, 4.9, 440.83), new VSC(3, 4.07, 647.01), new VSC(3, 4.66, 191.96), new VSC(3, 0.49, 323.51), new VSC(3, 3.18, 419.48), new VSC(2, 3.7, 88.87), new VSC(2, 3.32, 95.98), new VSC(2, 0.56, 117.32)];


// CAASaturn

export function CAASaturn() { }

CAASaturn.eclipticLongitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var rho5 = rho4 * rho;
    var nL0Coefficients = g_L0SaturnCoefficients.length;
    var L0 = 0;
    var i;
    for (i = 0; i < nL0Coefficients; i++) {
        L0 += g_L0SaturnCoefficients[i].a * Math.cos(g_L0SaturnCoefficients[i].b + g_L0SaturnCoefficients[i].c * rho);
    }
    var nL1Coefficients = g_L1SaturnCoefficients.length;
    var L1 = 0;
    for (i = 0; i < nL1Coefficients; i++) {
        L1 += g_L1SaturnCoefficients[i].a * Math.cos(g_L1SaturnCoefficients[i].b + g_L1SaturnCoefficients[i].c * rho);
    }
    var nL2Coefficients = g_L2SaturnCoefficients.length;
    var L2 = 0;
    for (i = 0; i < nL2Coefficients; i++) {
        L2 += g_L2SaturnCoefficients[i].a * Math.cos(g_L2SaturnCoefficients[i].b + g_L2SaturnCoefficients[i].c * rho);
    }
    var nL3Coefficients = g_L3SaturnCoefficients.length;
    var L3 = 0;
    for (i = 0; i < nL3Coefficients; i++) {
        L3 += g_L3SaturnCoefficients[i].a * Math.cos(g_L3SaturnCoefficients[i].b + g_L3SaturnCoefficients[i].c * rho);
    }
    var nL4Coefficients = g_L4SaturnCoefficients.length;
    var L4 = 0;
    for (i = 0; i < nL4Coefficients; i++) {
        L4 += g_L4SaturnCoefficients[i].a * Math.cos(g_L4SaturnCoefficients[i].b + g_L4SaturnCoefficients[i].c * rho);
    }
    var nL5Coefficients = g_L5SaturnCoefficients.length;
    var L5 = 0;
    for (i = 0; i < nL5Coefficients; i++) {
        L5 += g_L5SaturnCoefficients[i].a * Math.cos(g_L5SaturnCoefficients[i].b + g_L5SaturnCoefficients[i].c * rho);
    }
    var vvalue = (L0 + L1 * rho + L2 * rhosquared + L3 * rhocubed + L4 * rho4 + L5 * rho5) / 100000000;
    vvalue = CT.m360(CT.r2D(vvalue));
    return vvalue;
};

CAASaturn.eclipticLatitude = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var rho5 = rho4 * rho;
    var nB0Coefficients = g_B0SaturnCoefficients.length;
    var B0 = 0;
    var i;
    for (i = 0; i < nB0Coefficients; i++) {
        B0 += g_B0SaturnCoefficients[i].a * Math.cos(g_B0SaturnCoefficients[i].b + g_B0SaturnCoefficients[i].c * rho);
    }
    var nB1Coefficients = g_B1SaturnCoefficients.length;
    var B1 = 0;
    for (i = 0; i < nB1Coefficients; i++) {
        B1 += g_B1SaturnCoefficients[i].a * Math.cos(g_B1SaturnCoefficients[i].b + g_B1SaturnCoefficients[i].c * rho);
    }
    var nB2Coefficients = g_B2SaturnCoefficients.length;
    var B2 = 0;
    for (i = 0; i < nB2Coefficients; i++) {
        B2 += g_B2SaturnCoefficients[i].a * Math.cos(g_B2SaturnCoefficients[i].b + g_B2SaturnCoefficients[i].c * rho);
    }
    var nB3Coefficients = g_B3SaturnCoefficients.length;
    var B3 = 0;
    for (i = 0; i < nB3Coefficients; i++) {
        B3 += g_B3SaturnCoefficients[i].a * Math.cos(g_B3SaturnCoefficients[i].b + g_B3SaturnCoefficients[i].c * rho);
    }
    var nB4Coefficients = g_B4SaturnCoefficients.length;
    var B4 = 0;
    for (i = 0; i < nB4Coefficients; i++) {
        B4 += g_B4SaturnCoefficients[i].a * Math.cos(g_B4SaturnCoefficients[i].b + g_B4SaturnCoefficients[i].c * rho);
    }
    var nB5Coefficients = g_B5SaturnCoefficients.length;
    var B5 = 0;
    for (i = 0; i < nB5Coefficients; i++) {
        B5 += g_B5SaturnCoefficients[i].a * Math.cos(g_B5SaturnCoefficients[i].b + g_B5SaturnCoefficients[i].c * rho);
    }
    var vvalue = (B0 + B1 * rho + B2 * rhosquared + B3 * rhocubed + B4 * rho4 + B5 * rho5) / 100000000;
    vvalue = CT.r2D(vvalue);
    return vvalue;
};

CAASaturn.radiusVector = function (JD) {
    var rho = (JD - 2451545) / 365250;
    var rhosquared = rho * rho;
    var rhocubed = rhosquared * rho;
    var rho4 = rhocubed * rho;
    var rho5 = rho4 * rho;
    var nR0Coefficients = g_R0SaturnCoefficients.length;
    var R0 = 0;
    var i;
    for (i = 0; i < nR0Coefficients; i++) {
        R0 += g_R0SaturnCoefficients[i].a * Math.cos(g_R0SaturnCoefficients[i].b + g_R0SaturnCoefficients[i].c * rho);
    }
    var nR1Coefficients = g_R1SaturnCoefficients.length;
    var R1 = 0;
    for (i = 0; i < nR1Coefficients; i++) {
        R1 += g_R1SaturnCoefficients[i].a * Math.cos(g_R1SaturnCoefficients[i].b + g_R1SaturnCoefficients[i].c * rho);
    }
    var nR2Coefficients = g_R2SaturnCoefficients.length;
    var R2 = 0;
    for (i = 0; i < nR2Coefficients; i++) {
        R2 += g_R2SaturnCoefficients[i].a * Math.cos(g_R2SaturnCoefficients[i].b + g_R2SaturnCoefficients[i].c * rho);
    }
    var nR3Coefficients = g_R3SaturnCoefficients.length;
    var R3 = 0;
    for (i = 0; i < nR3Coefficients; i++) {
        R3 += g_R3SaturnCoefficients[i].a * Math.cos(g_R3SaturnCoefficients[i].b + g_R3SaturnCoefficients[i].c * rho);
    }
    var nR4Coefficients = g_R4SaturnCoefficients.length;
    var R4 = 0;
    for (i = 0; i < nR4Coefficients; i++) {
        R4 += g_R4SaturnCoefficients[i].a * Math.cos(g_R4SaturnCoefficients[i].b + g_R4SaturnCoefficients[i].c * rho);
    }
    var nR5Coefficients = g_R5SaturnCoefficients.length;
    var R5 = 0;
    for (i = 0; i < nR5Coefficients; i++) {
        R5 += g_R5SaturnCoefficients[i].a * Math.cos(g_R5SaturnCoefficients[i].b + g_R5SaturnCoefficients[i].c * rho);
    }
    return (R0 + R1 * rho + R2 * rhosquared + R3 * rhocubed + R4 * rho4 + R5 * rho5) / 100000000;
};

var CAASaturn$ = {};

registerType("CAASaturn", [CAASaturn, CAASaturn$, null]);
