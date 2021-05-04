"""Calculate XYZ conversion matrices."""
"""Derived from https://gist.githubusercontent.com/facelessuser/7d3707734fa9bcf208ab4dabea830cdb/raw/52a6effaec9b8b3662d28cd1378799639d1b4ef7/matrix_calc.py """
import numpy as np

np.set_printoptions(precision=17, suppress='true', sign='-', floatmode='fixed')

"""From ASTM E308-01"""
""" white_d65 = [0.95047, 1.00000, 1.08883]"""

""" white_d50 = [0.96422, 1.00000, 0.82521]"""

""" From CIE 15:2004 table T.3 chromaticities"""

"""white_d65 = [0.31272 / 0.32903, 1.00000, (1.0 - 0.31272 - 0.32903) / 0.32903]"""

"""white_d50 = [0.34567 / 0.35851, 1.00000, (1.0 - 0.34567 - 0.35851) / 0.35851]"""

""" From CIE 15:2004 table T.3 XYZ"""

"""white_d65 = [0.9504, 1.0000, 1.0888]"""

"""white_d50 = [0.9642, 1.0000, 0.8251]"""

"""The four-digit chromaticity ones that everyone uses, including the sRGB standard, for compatibility"""

white_d65 = [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290]
white_d50 = [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585]


def get_matrix(wp, space):
    """Get the matrices for the specified space."""

    if space == 'srgb':
        xr = 0.64
        yr = 0.33
        xg = 0.30
        yg = 0.60
        xb = 0.15
        yb = 0.06
    elif space == 'display-p3':
        xr = 0.68
        yr = 0.32
        xg = 0.265
        yg = 0.69
        xb = 0.150
        yb = 0.060
    elif space == 'rec2020':
        xr = 0.708
        yr = 0.292
        xg = 0.17
        yg = 0.797
        xb = 0.131
        yb = 0.046
    elif space == 'a98-rgb':
        xr = 0.64
        yr = 0.33
        xg = 0.21
        yg = 0.71
        xb = 0.15
        yb = 0.06
    elif space == 'prophoto-rgb':
        xr = 0.734699
        yr = 0.265301
        xg = 0.159597
        yg = 0.840403
        xb = 0.036598
        yb = 0.000105
    else:
        raise ValueError

    m = [
        [xr / yr, 1.0, (1.0 - xr - yr) / yr],
        [xg / yg, 1.0, (1.0 - xg - yg) / yg],
        [xb / yb, 1.0, (1.0 - xb - yb) / yb]
    ]
    mi = np.linalg.inv(m)

    r, g, b = np.dot(wp, mi)
    rgb = [
        [r],
        [g],
        [b]
    ]
    rgb2xyz = np.multiply(rgb, m).transpose()
    xyz2rgb = np.linalg.inv(rgb2xyz)

    return rgb2xyz, xyz2rgb


if __name__ == "__main__":
    print('===== sRGB =====')
    to_xyz, from_xyz = get_matrix(white_d65, 'srgb')
    print('--- rgb -> xyz ---')
    print(to_xyz)
    print('--- xyz -> rgb ---')
    print(from_xyz)

    print('===== Display P3 =====')
    to_xyz, from_xyz = get_matrix(white_d65, 'display-p3')
    print('--- rgb -> xyz ---')
    print(to_xyz)
    print('--- xyz -> rgb ---')
    print(from_xyz)

    print('===== Adobe 98 =====')
    to_xyz, from_xyz = get_matrix(white_d65, 'a98-rgb')
    print('--- rgb -> xyz ---')
    print(to_xyz)
    print('--- xyz -> rgb ---')
    print(from_xyz)

    print('===== Rec.2020 =====')
    to_xyz, from_xyz = get_matrix(white_d65, 'rec2020')
    print('--- rgb -> xyz ---')
    print(to_xyz)
    print('--- xyz -> rgb ---')
    print(from_xyz)

    print('===== ProPhoto =====')
    to_xyz, from_xyz = get_matrix(white_d50, 'prophoto-rgb')
    print('--- rgb -> xyz ---')
    print(to_xyz)
    print('--- xyz -> rgb ---')
    print(from_xyz)
