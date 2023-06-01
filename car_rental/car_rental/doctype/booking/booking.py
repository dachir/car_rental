# Copyright (c) 2023, Richard Amouzou and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document

class Booking(Document):
	pass

@frappe.whitelist()
def create_quotation(doc):
	doc = frappe._dict(json.loads(doc))
	quotation_details = []	
	for i in doc.booking_details:
		item = frappe._dict(i)
		code = item.make + " " + item.model
		product = frappe.db.sql(
					"""
						select name,item_name
					   	from `tabItem`
					   	where name = %(name)s 
					""",
					{ "name":code },
					as_dict =True,
				)
		#frappe.msgprint(str(product[0].item_name))
		price = 0
		if doc.rent_type == "Rent Per Km" :
			price = frappe.db.get_value("Vehicle", item.license_plate, "rent_per_km")
		elif doc.rent_type == "Rent Per Hour" :
			price = frappe.db.get_value("Vehicle", item.license_plate, "rent_per_hour")
		else :
			price = frappe.db.get_value("Vehicle", item.license_plate, "rent_per_day")

		product_name = product[0].item_name
		if doc.with_driver == 1:
			price = price + frappe.db.get_value("Vehicle", item.license_plate, "driver_rate")
			product_name = product_name + " With driver"

		details = frappe._dict({
			"item_code": code,
			"description": product_name,
			"qty": item.qty,
			"rate": price,
			"doctype": "Quotation Item",
			#"date_action": item.date_action,
		})
		quotation_details.append(details)
		
	args = frappe._dict(
			{
				"quotaion_to": "Customer",
				"customer": doc.customer,
				"party_name": doc.customer,
				"posting_date": doc.date,
				#"currency": doc.currency,
				"doctype": "Quotation",
				"booking":doc.name,
				"items":quotation_details,
			}
		)
	#frappe.msgprint(str(args))
	doc = frappe.get_doc(args)
	doc.insert()

	return doc.name
	
@frappe.whitelist()
def get_Checklist():
	return frappe.db.sql(
		"""
			SELECT *
			FROM tabChecklist
		""", as_dict = 1
		)

@frappe.whitelist()
def get_availability(category=None, make=None, model=None, location=None, name=None,page_length=25):
	return frappe.db.sql(
		"""
			SELECT *
			FROM tabVehicle
		"""
		, as_dict = 1
		)