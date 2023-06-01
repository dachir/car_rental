// Copyright (c) 2023, Richard Amouzou and contributors
// For license information, please see license.txt

frappe.ui.form.on('Booking', {
	setup: function(frm) {
		
	},
	refresh: function(frm) {
		if (frm.is_new() && frm.doc.docstatus==0){
			frappe.call({
				method: 'car_rental.car_rental.doctype.booking.booking.get_Checklist',
				callback: function(r){
					if (r.message) {
						//frm.clear_table("Checklist Details");
						console.log(r.message);
						r.message.forEach(e => {
							var row = frm.add_child('checklist_details');
							row.checklist = e.checklist_name;
							row.is_checked = 1;
						});

						frm.refresh_field('checklist_details');
						frm.dirty();
						//frm.refresh();
					}
				}
			});
			if(frm.doc.sales_person == undefined) frm.set_value('sales_person', frappe.session.user);
		}
		
		/*// MultiSelectDialog with custom query method
		refresh: function(frm) {
		
		let query_args = {
			query:"car_rental.car_rental.doctype.booking.booking.get_availability",
			filters: {  
				name: frm.doc.name
			}
		}

		frm.add_custom_button('Get Vehicles',(frm) =>{
			new frappe.ui.form.MultiSelectDialog({
				doctype: "Vehicle",
				target: frm,
				setters: {
					category: null,
					make: null,
					model: null,
					location: null
				},
				columns: ["category","name","make","model","location"],
				add_filters_group: 1,
				//date_field: "acquisition_date",
				get_query() {
					return query_args;
				},
				action(selections) {
					console.log(selections);
				},
			});
	
		});*/

		frm.add_custom_button('Get Vehicles',(frm) =>{
			new frappe.ui.form.MultiSelectDialog({
				doctype: "Vehicle",
				target: frm,
				setters: {
					category: cur_frm.doc.category,
					make: cur_frm.doc.make,
					model: cur_frm.doc.model,
					location: cur_frm.doc.location,
				},
				columns: ["category","name","make","model","location"],
				add_filters_group: 0,
				//date_field: "acquisition_date",
				/*get_query() {
					return {
						filters: {name: "01"}
					}
				},*/
				action(selections) {
					console.log(selections);
					selections.forEach(e => {
						var row = cur_frm.add_child('booking_details');
						row.license_plate = e;
						row.qty = frappe.datetime.get_day_diff(cur_frm.doc.end_date,cur_frm.doc.start_date) + 1;
					});
					cur_frm.dirty();
					cur_frm.refresh_field('booking_details');
					
				},
			});
	
		},"Utilities");		

		frm.add_custom_button('Create Quotation',(frm) =>{
			frappe.call({
				method: 'car_rental.car_rental.doctype.booking.booking.create_quotation',
				args: {
					doc: cur_frm.doc,
				},
				callback: function(r){
					if (r.message) {
						//frm.clear_table("Checklist Details");
						//console.log(r.message);
						frappe.set_route('Form', 'Quotation',{"name": r.message});
					}
				}
			});
	
		},"Utilities");		
	}
});

frappe.ui.form.on('Booking Details', {
	
    license_plate(frm, cdt, cdn) {
		var row = locals[cdt][cdn];
        const old_value =  row.valeur_finale;
        if(cur_frm.doc.end_date.length > 0 && cur_frm.doc.start_date.length > 0 ){
			row.qty = frappe.datetime.get_day_diff(cur_frm.doc.end_date,cur_frm.doc.start_date) + 1;
		}
		else{
			row.qty = "";
		}
        frm.doc.total = frm.doc.total - old_value + row.valeur_finale;
        frm.refresh_field('booking_details');
    },
});
