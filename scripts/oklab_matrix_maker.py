"""
Calculate `oklab` matrices.

Björn Ottosson, in his original calculations, used a different white point than
what CSS and most other people use. In the CSS repository, he commented on
how to calculate the M1 matrix using the exact same white point as CSS. He
provided the initial matrix used in this calculation, which we will call M0.
https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-945714988.
This M0 matrix is used to create a precise matrix to convert XYZ to LMS using
the D65 white point as specified by CSS. Both ColorAide and CSS use the D65
chromaticity coordinates of `(0.31270, 0.32900)` which is documented and used
for sRGB as the standard. There are likely implementations unaware that the
they should, or even how to adapt the Oklab M1 matrix to their white point
as this is not documented in the author's Oklab blog post, but is buried in a
CSS repository discussion.

Additionally, the documented M2 matrix is specified as 32 bit values, and the
inverse is calculated directly from this 32 bit matrix. The forward and reverse
transform is calculated to perfectly convert 32 bit values, but when translating
64 bit values, the transform adds a lot of noise after about 7 - 8 digits (the
precision of 32 bit floats). This is particularly problematic for achromatic
colors in Oklab and OkLCh and can cause chroma not to resolve to zero.

To provide an M2 matrix that works better for 64 bit, we take the inverse M2,
which provides a perfect transforms to white from Oklab `[1, 0, 0]` in 32 bit
floating point. We process the matrix as float 32 bit values and emit them as 64
bit double values, ~17 digit double accuracy. We then calculate the forward
matrix. This gives us a transform in 64 bit that drives chroma extremely close
to zero for 64 bit doubles and maintains the same 32 bit precision of up to
about 7 digits, the 32 bit accuracy limit (~7.22).
"""
import struct
import numpy as np

np.set_printoptions(precision=16, sign='-', floatmode='fixed')

WHITE = [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290]

RGB_TO_XYZ = [
    [ 0.41239079926595934, 0.357584339383878,   0.1804807884018343  ],
    [ 0.21263900587151027, 0.715168678767756,   0.07219231536073371 ],
    [ 0.01933081871559182, 0.11919477979462598, 0.9505321522496607  ]
]


float32 = np.vectorize(lambda value: struct.unpack('f', struct.pack('f', value))[0])

# Matrix provided by the author of Oklab to allow for calculating a precise M1 matrix
# using any white point.
M0 = [
    [0.77849780, 0.34399940, -0.12249720],
    [0.03303601, 0.93076195, 0.03620204],
    [0.05092917, 0.27933344, 0.66973739]
]

# Calculate XYZ to LMS and LMS to XYZ using our white point.
XYZ_TO_LMS = np.divide(M0, np.outer(np.dot(M0, WHITE), np.ones(3)))

# Calculate the inverse
LMS_TO_XYZ = np.linalg.inv(XYZ_TO_LMS)

# Calculate linear sRGB to LMS (used for Okhsl and Okhsv)
SRGBL_TO_LMS = np.dot(XYZ_TO_LMS, RGB_TO_XYZ)
LMS_TO_SRGBL = np.linalg.inv(SRGBL_TO_LMS)

# Oklab specifies the following matrix as M1 along with the inverse.
# ```
# LMS3_TO_OKLAB = [
#     [0.2104542553, 0.7936177850, -0.0040720468],
#     [1.9779984951, -2.4285922050, 0.4505937099],
#     [0.0259040371, 0.7827717662, -0.8086757660]
# ]
# ```
# But since the matrix is provided in 32 bit, we are not able to get the
# proper inverse for `[1, 0, 0]` in 64 bit, even if we calculate the
# new 64 bit inverse for the above forward transform. What we need is a
# proper 64 bit forward and reverse transform.
#
# In order to adjust for this, we take documented 32 bit inverse matrix which
# gives us a perfect translation from Oklab `[1, 0, 0]` to LMS of `[1, 1, 1]`
# and parse the matrix as float 32 and emit it as 64 bit and then take the inverse.
OKLAB_TO_LMS3 = float32(
    [
        [1.0, 0.3963377774, 0.2158037573],
        [1.0, -0.1055613458, -0.0638541728],
        [1.0, -0.0894841775, -1.2914855480]
    ]
)

# Calculate the inverse
LMS3_TO_OKLAB = np.linalg.inv(OKLAB_TO_LMS3)

if __name__ == "__main__":
    print('===== sRGB Linear -> lms =====')
    print(SRGBL_TO_LMS)
    print('===== lms -> sRGB Linear =====')
    print(LMS_TO_SRGBL)
    print('===== XYZ D65 Linear -> lms =====')
    print(XYZ_TO_LMS)
    print('===== lms -> XYZ D65 =====')
    print(LMS_TO_XYZ)
    print('===== lms ** 1/3 -> Oklab =====')
    print(LMS3_TO_OKLAB)
    print('===== Oklab -> lms ** 1/3 =====')
    print(OKLAB_TO_LMS3)
