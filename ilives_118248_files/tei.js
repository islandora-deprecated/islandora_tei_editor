/*
 * File: plugins/teieditor/fckplugin.js
 * Author: Nigel Banks
 * Last Modified: Tue, Jul 14th, 2009   
 *
 * Defines functionality that allows users to easily add/remove/edit tags from a
 * TEI encoded document.
 */

/* 
 *  Contains all data and functions, used to prevent namespace collisions. 
 */
TEI = function()
{                                                                                     
    /****************************************************************************       
     * @TEIEditorPlugin.att
     *
     * Description:
     *  Constructor for the all Attribute Classes, 
     *  Attributes, and all related helper functions.
     ***************************************************************************/
var validate =
	    {	   	    
		// Never Throws. Only acceptable to use this with a attribute that 
		// restricts the value of its form element to only valid choices.
		// ex: att.personal.attributes.full.
		alwaysValid: function(value) 
		{
		},
		list: function(value) // Special function that performs a validation check on each value in the list.
		{
		    var values = value.split(/[ ]*/);
		    // Check that it falls into the correct range for a list.
		    if (values.length < this.atLeast && !(values.length == 0 && this.optional))
			throw this;
		    else if (values.length > this.atMost)
			throw this;

		    // Validate each member of the list.
		    for(var i=0; i<values.length; i++)
		    {
			this.listValidate(values[i]);
		    }
		    return true;
		},	 
   		xsd:
		{
		    anyURI: function(value)
		    {
			if((value=="" || value==undefined) && this.optional)
			    return;
			else
			{			
			    var xmlString = '<?xml version="1.0"?><!DOCTYPE root [<!ELEMENT test PCDATA>]><root><test>text</test></root>';
			    //<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="http://www.w3schools.com" xmlns="http://www.w3schools.com" elementFormDefault="qualified"><xs:element name="root"><xs:complexType><xs:sequence><xs:element name="test" type="xs:anyURI"/></xs:sequence></xs:complexType></xs:element></xs:schema>
			    var xmlobject = (new DOMParser()).parseFromString(xmlString, "text/xml");		    
			    xmlobject;
			}
		    },
		    id: function(value)
		    {
		    },
		    nonNegativeInteger: function(value)
		    {
			if(!((value > 0) || (this.optional && value=="")))
			    throw this;
		    }
		},
		data:
		{		
		    certainty: function(value)
		    {
		    },
		    duration:
		    {
			w3c: function(value)
			{			
			},
			iso: function(value)
			{			
			}
		    },
		    enumerated: function(value)
		    {		    
		    },
		    key: function(value)
		    {
		    },
		    language: function(value)
		    {
		    },
		    numeric: function(value)
		    {
			if(typeof Number(value) != 'number')
			    throw this;
		    },
		    /*pointer: function(value)
		    {
			this.TEIEditorPlugin.att.validate.xsd.anyURI(value);
		    },*/
		    temporal:
		    {
			w3c: function(value)
			{
			},
			iso: function(value)
			{
			},
		    },
		    word: function(value)
		    {
		    }
		}	   
	    };
    validate.data.pointer = validate.xsd.anyURI;

    var att = new (function()
    {	    	    		
	
	//-----------------------------------------------------------------------
	// @TEIEditorPlugin.att.{#AttributeClass}
	//
	// Description:	
  	//  Attribute Classes, define all aspects of each elements attributes.
	//-----------------------------------------------------------------------
	this.global =
	    {
		name: "att.global",
		doc: "Provides attributes common to all elements in the TEI encoding scheme.",
	    	analytic:
		{
		    name: "att.global.analytic",
		    doc: "Provides additional global attributes for associating specific analyses or interpretations with appropriate portions of a text.",
		    attributes:
		    {
			ana:
			{
			    name: "ana",
			    doc: "(Analysis) indicates one or more elements containing interpretations of the element on which the ana attribute appears.",
			    optional: true,
			    atLeast: 1,
			    atMost: Infinity,
			    validate: validate.list,
			    listValidate: validate.data.pointer,
			}
		    }
		},
		linking:
		{
		    name: "att.global.linking",
		    doc: "Defines a set of attributes for hypertext and other linking, which are enabled for all elements when the additional tag set for linking is selected.",
		    attributes:
		    {
			corresp:
			{
			    name: "corresp",
			    doc: "(Corresponds) points to elements that correspond to the current element in some way.",
			    optional: true,
			    validate: validate.list,
			    atLeast: 1,
			    atMost: Infinity,
			    listValidate: validate.data.pointer,
			},
			synch:
			{
			    name: "synch",
			    doc: "(Synchronous) points to elements that are synchronous with the current element.",
			    optional: true,
			    atLeast: 1,
			    atMost: Infinity,			
			    validate: validate.list,
			    listValidate: validate.data.pointer,
			},
			sameAs:
			{
			    name: "sameAs",
			    doc: "Points to an element that is the same as the current element. ",
			    optional: true,
			    validate: validate.data.pointer,
			},
			copyOf:
			{
			    name: "copyOf",
			    doc: "Points to an element of which the current element is a copy.",
			    optional: true,
			    validate: validate.data.pointer,
			},
			next:
			{
			    name: "next",
			    doc: "Points to the next element of a virtual aggregate of which the current element is part.",
			    optional: true,
			    validate: validate.data.pointer,
			},
			prev:
			{
			    name: "prev",
			    doc: "(Previous) points to the previous element of a virtual aggregate of which the current element is part.",
			    optional: true,
			    validate: validate.data.pointer,
			},
			exclude:
			{
			    name: "exclude",
			    doc: "Points to elements that are in exclusive alternation with the current element.",
			    optional: true,
			    atLeast: 1,
			    atMost: Infinity,
			    validate: validate.list,
			    listValidate: validate.data.pointer,
			},
			select:
			{
			    name: "select",
			    doc: "Selects one or more alternants; if one alternant is selected, the ambiguity or uncertainty is marked as resolved. If more than one alternant is selected, the degree of ambiguity or uncertainty is marked as reduced by the number of alternants not selected.",
			    optional: true,
			    atLeast: 1,
			    atMost: Infinity,
			    validate: validate.list,
			    listValidate: validate.data.pointer,
			}
		    }
		},
		facs:
		{
		    name: "att.global.facs",
		    doc: "Groups elements corresponding with all or part of an image, because they contain an alternative representation of it, typically but not necessarily a transcription of it.",
		    attributes:
		    {
			facs:
			{
			    name: "facs",
			    doc: "(Facsimile) points to all or part of an image which corresponds with the content of the element. ",
			    optional: true,
			    atLeast: 1,
			    atMost: Infinity,
			    validate: validate.list,
			    listValidate: validate.data.pointer,
			}
		    }
		},
	    },
	this.global.attributes =
	    {
		attGlobalAnalytic: this.global.analytic,	    
		attGlobalLinking: this.global.linking,
		attGlobalFacs: this.global.facs,
		xml_id:
		{
		    name: "xml:id",
		    doc: "(Identifier) provides a unique identifier for the element bearing the attribute. ",
		    optional: true,
		    validate: validate.xsd.id,
		},
		n:
		{
		    name: "n",
		    doc: "(Number) gives a number (or other label) for an element, which is not necessarily unique within the document.",
		    optional: true,
		    atLeast: 1,
		    atMost: Infinity,
		    validate: validate.list,
		    listValidate: validate.data.word,
		},
		xml_lang:
		{
		    name: "xml:lang",
		    doc: "(Language) indicates the language of the element content using a ‘tag’ generated according to BCP 47",
		    optional: true,
		    validate: validate.data.language,
		},
		rend:
		{
		    name: "rend",
		    doc: "(Rendition) indicates how the element in question was rendered or presented in the source text.",
		    optional: true,
		    atLeast: 1,
		    atMost: Infinity,
		    validate: validate.list,
		    listValidate: validate.data.word,
		},
		rendition:
		{
		    name: "rendition",
		    doc: "Points to a description of the rendering or presentation used for this element in the source text.",
		    optional: true,
		    atLeast: 1,
		    atMost: Infinity,
		    validate: validate.list,
		    listValidate: validate.data.pointer,
		},
		xml_base:
		{
		    name: "xml:base",
		    doc: "Provides a base URI reference with which applications can resolve relative URI references into absolute URI references.",
		    optional: true,
		    validate: validate.data.pointer,
		}
	    };
	this.typed =
	    {
		name: "att.typed",
		doc: "Provides attributes which can be used to classify or subclassify elements in any way.",
	    	attributes:
		{
		    type:
		    {
			name: "type",
			doc: "Characterizes the element in some sense, using any convenient classification scheme or typology.",
			optional: true,
			validate: validate.data.enumerated,
		    },
		    subtype:
		    {
			name: "subtype",
			doc: "Provides a sub-categorization of the element, if needed.",
			optional: true,
			validate: validate.data.enumerated,
		    }
		}
	    },
	this.canonical =
	    {
		name:"att.canonical",
		doc: "Provides attributes which can be used to associate a representation such as a name or title with canonical information about the object being named or referenced.",
	    	attributes:
		{
		    key:
		    {
			name: "key",
			doc: "Provides an externally-defined means of identifying the entity (or entities) being named, using a coded value of some kind.",
			optional: true,
			validate: validate.data.key, // Any string of unicode characters apparently.
		    },
		    ref:
		    {
			name: "ref",
			doc: "(Reference) provides an explicit means of locating a full definition for the entity being named by means of one or more URIs.",
			optional: true,
			atLeast: 1,
			atMost: Infinity,
		    	validate: validate.list,
			listValidate: validate.data.pointer,
		    }
		},
	    },
	this.naming =
	    {
		name:"att.naming",
		doc: "Provides attributes common to elements which refer to named persons, places, organizations etc.",
	    	attributes: 
		{	
		    attCanonical: this.canonical,
		    nymRef:
		    {
			name: "nymRef",
			doc: "(Reference to the canonical name) provides a means of locating the canonical form (nym) of the names associated with the object named by the element bearing it.",
			optional: true,
			atLeast: 1,
			atMost: Infinity, 
		    	validate: validate.list,
			listValidate: validate.data.pointer,
		    },
		},	    
	    };
	this.personal = 
	    {
		name:"att.personal",
		doc: "(Attributes for components of personal names) Common attributes for those elements which form part of a personal name.",
	    	attributes: 
		{
		    attNaming: this.naming,
		    full: 
		    {
			name: "full",
			doc: "Indicates whether the name component is given in full, as an abbreviation or simply as an initial.",
			optional: true,
			options: ['', 'yes', 'abb', 'init'],
			validate: validate.alwaysValid, // Can only select on of the valid options.
		    },
		    sort:
		    {
			name: "sort",
			doc: "Specifies the sort order of the name component in relation to others within the personal name.",
			optional: true,
			validate: validate.xsd.nonNegativeInteger,
		    }
		},
	    };
	this.ranging =
	    {
		name: "att.ranging",
		doc: "Provides attributes for describing numerical ranges.",
	    	attributes:
		{
		    atLeast:
		    {
			name: "atLeast",
			doc: "Gives a minimum estimated value for the approximate measurement.",
			optional: true,
			validate: validate.data.numeric,
		    },
		    atMost:
		    {
			name: "atMost",
			doc: "Gives a maximum estimated value for the approximate measurement.",
			optional: true,
			validate: validate.data.numeric,
		    },
		    min:
		    {
			name: "min",
			doc: "Where the measurement summarizes more than one observation or a range, supplies the minimum value observed.",
			optional: true,
			validate: validate.data.numeric,
		    },
		    max:
		    {
			name: "max",
			doc: "Where the measurement summarizes more than one observation or a range, supplies the maximum value observed.",
			optional: true,
			validate: validate.data.numeric,
		    },
		}
	    };
	this.dimensions =
	    {
		name: "att.dimensions",
		doc: "Provides attributes for describing the size of physical objects.",
	    	attributes:
		{
		    attRanging: this.ranging,
		    unit:
		    {
			name: "unit",
			doc: "Names the unit used for the measurement.",
			optional: true,
			validate: validate.data.enumerated,
		    },
		    quantity:
		    {
			name: "quantity",
			doc: "Specifies the length in the units specified.",
			optional: true,
			validate: validate.data.numeric,
		    },
		    extent:
		    {
			name: "extent",
			doc: "Indicates the size of the object concerned using a project-specific vocabulary combining quantity and units in a single string of words.",
			optional: true,
			atLeast: 1,
			atMost: Infinity,
			validate: validate.list,
			listValidate: validate.data.word,
		    },
		    precision:
		    {
			name: "precision",
			doc: "Characterizes the precision of the values specified by the other attributes.",
			optional: true,
			validate: validate.data.certainty,
		    },
		    scope:
		    {
			name: "scope",
			doc: "Where the measurement summarizes more than one observation, specifies the applicability of this measurement.",
			optional: true,
			validate: validate.data.enumerated,
		    },
		}
	    };
	this.editLike =
	    {
		name: "att.editLike",
		doc: "Provides attributes describing the nature of a encoded scholarly intervention or interpretation of any kind.",
	    	attributes:
		{
		    attDimensions: this.dimensions,
		    cert:
		    {
			name: "cert",
			doc: "(Certainty) signifies the degree of certainty associated with the intervention or interpretation.",
			optional: true,
			validate: validate.data.certainty,
		    },
		    resp:
		    {
			name: "resp",
			doc: "(Responsible party) indicates the agency responsible for the intervention or interpretation, for example an editor or transcriber.",
			optional: true,
			atLeast: 1,
			atMost: Infinity,
			validate: validate.list,
			listValidate: validate.data.pointer,
		    },
		    evidence:
		    {
			name: "evidence",
			doc: "Indicates the nature of the evidence supporting the reliability or accuracy of the intervention or interpretation.",
			optional: true,
			validate: validate.data.enumerated,
		    },
		    source:
		    {
			name: "source",
			doc: "Contains a list of one or more pointers indicating the sources which support the given reading.",
			optional: true, // Mandatory when applicable...
			atLeast: 1,
			atMost: Infinity,
			validate: validate.list,
			listValidate: validate.data.pointer,
		    },
		}
	    };	
	this.datable = 
	    {
		name:"att.datable",
		doc:"Provides attributes for normalization of elements that contain dates, times, or datable events.",
	    	w3c:
		{
		    name: "att.datable.w3c",
		    doc: "provides attributes for normalization of elements that contain datable events using the W3C datatypes.",
		    attributes:
		    {
			period:
			{
			    name: "period",
			    doc: "Supplies a pointer to some location defining a named period of time within which the datable item is understood to have occurred.",
			    optional: true,
			    validate: validate.data.pointer,
			},
			when:
			{
			    name: "when",
			    doc: "Supplies the value of the date or time in a standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.w3c,
			},
			notBefore:
			{
			    name: "notBefore",
			    doc: "Specifies the earliest possible date for the event in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.w3c,
			},
			notAfter:
			{
			    name: "notAfter",
			    doc: "Specifies the latest possible date for the event in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.w3c,
			},
			from:
			{
			    name: "from",
			    doc: "Indicates the starting point of the period in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.w3c,
			},
			to:
			{
			    name: "to",
			    doc: "Indicates the ending point of the period in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.w3c,
			},
		    }
		},
		iso:
		{
		    name: "att.datable.iso",
		    doc: "Provides attributes for normalization of elements that contain datable events using the ISO 8601 standard.",
		    attributes:
		    {
			when_iso:
			{
			    name: "when-iso",
			    doc: "Supplies the value of a date or time in a standard form.",
			    optional: true,
			    validate: validate.data.temporal.iso,
			},
			notBefore_iso:
			{
			    name: "notBefore-iso",
			    doc: "Specifies the earliest possible date for the event in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.iso,
			},
			notAfter_iso:
			{
			    name: "notAfter-iso",
			    doc: "Specifies the latest possible date for the event in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.iso,
			},
			from_iso:
			{
			    name: "from-iso",
			    doc: "Indicates the starting point of the period in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.iso,
			},
			to_iso:
			{
			    name: "to-iso",
			    doc: "Indicates the ending point of the period in standard form, e.g. yyyy-mm-dd.",
			    optional: true,
			    validate: validate.data.temporal.iso,
			},
		    }
		}
	    }
	this.datable.attributes =
	    {
		attDatableW3C: this.datable.w3c,
		attDatableISO: this.datable.iso,
	    };
	this.duration =
	    {
		name: "att.duration",
		doc: "Provides attributes for normalization of elements that contain datable events.",
	    	w3c:
		{
		    name: "att.duration.w3c",
		    doc: "Attributes for recording normalized temporal durations.",
		    attributes:
		    {
			dur:
			{
			    name: "dur",
			    doc: "(Duration) indicates the length of this element in time.",
			    optional: true,
			    validate: validate.data.duration.w3c,
			}
		    }
		},
		iso:
		{
		    name: "att.duration.iso",
		    doc: "Attributes for recording normalized temporal durations.",
		    attributes:
		    {
			dur_iso:
			{
			    name: "dur-iso",
			    doc: "(Duration) indicates the length of this element in time.",
			    optional: true,
			    validate: validate.data.duration.iso,
			}
		    }
		}
	    };
	this.duration.attributes =
	    {
		attDurationW3C: this.duration.w3c,
		attDurationISO: this.duration.iso,
	    };
    })(); 
    /****************************************************************************
     * @TEIEditorPlugin.element
     * 
     * Description:
     *  Constructor for the all Element Classes, 
     *  and all related helper functions.
     ***************************************************************************/
    var element = new (function ()
    {	
	// Actual Elements
	this.persname = {
	    name: 'persName', 
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.datable, att.editLike, att.personal, att.typed],	    
	    //[model.persStateLike, model.nameLike.agent]
	};
	this.forename = {	    
	    name: 'forename', 
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.personal, att.typed],
	    CHANGEME: ['persName'],
	    //[model.persNamePart]
	};
	this.surname = {
	    name: 'surname',
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.personal, att.typed],
	    CHANGEME: ['persName'],
	    //[model.persNamePart]
	};
	this.addname = {
	    name: 'addName',
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.personal, att.typed],
	    CHANGEME: ['persName'],
	    //[model.persNamePart]
	};
	this.genname = {
	    name: 'genName',
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.personal, att.typed],
	    CHANGEME: ['persName'],
	    //[model.persNamePart]
	};
	this.rolename = {
	    name: 'roleName',
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.personal, att.typed],
	    CHANGEME: ['persName'],
	    //[model.persNamePart]
	};
	this.orgname = {
	    name: 'orgName',
	    bgColor: '#d5e5f1', 
	    attributes: [att.global, att.datable, att.editLike, att.personal, att.typed],
	    //[model.nameLike.agent]
	};
	this.date = {
	    name: 'date',
	    bgColor: '#ecd4cd', 
	    attributes: [att.global, att.datable, att.duration, att.editLike, att.typed, 
			 { name: "calender",  // Inline attribute
			   doc: "indicates the system or calendar to which the date represented by the content of this element belongs.", 
			   optional: true,
			   validate: validate.data.enumerated,			   
			 }],
	    //[model.dateLike, model.publicationStmtPart]
	};
	this.placename = {
	    name: 'placeName',
	    bgColor: '#cceecc', 
	    attributes: [att.global, att.naming, att.typed, att.datable, att.editLike],
	    //[model.placeNamePart]
	};
	this.country = {
	    name: 'country',
	    bgColor: '#cceecc', 
	    attributes: [att.global, att.naming, att.typed, att.datable],
	    CHANGEME: ['placeName'],
	    //[model.placeNamePart]
	};
	this.region = {
	    name: 'region',
	    bgColor: '#cceecc', 
	    attributes: [att.global, att.naming, att.typed, att.datable],
	    CHANGEME: ['placeName'],
	    //[model.placeNamePart]
	};
	this.settlement = {
	    name: 'settlement',
	    bgColor: '#cceecc', 
	    attributes: [att.global, att.naming, att.typed, att.datable],
	    CHANGEME: ['placeName'],
	    //[model.placeNamePart]
	};
	this.district = {
	    name: 'district',
	    bgColor: '#cceecc', 
	    attributes: [att.global, att.naming, att.typed, att.datable],
	    CHANGEME: ['placeName'],
	    //[model.placeNamePart]
	};
	this.geogname = {
	    name: 'geogName',
	    bgColor: '#cceecc', 
	    attributes: [att.global, att.naming, 
			 {
			     name: "type",
			     doc: "Provides more culture- linguistic- or application- specific information used to categorize this name component.",
			     optional: true, // Mandatory when applicable
			     validate: validate.data.enumerated,
			 }],
	    CHANGEME: ['placeName'],
	    //[model.placeNamePart]
	};
    })();

    //
    this.att = att;
    this.element = element;
}

//TEI = new TEI();

