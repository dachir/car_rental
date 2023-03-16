from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in car_rental/__init__.py
from car_rental import __version__ as version

setup(
	name="car_rental",
	version=version,
	description="Car Rental Application",
	author="Richard Amouzou",
	author_email="dodziamouzou@gmail.com",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
